# Adding a Recipe

## Feature Description 

This is the first main feature of Meal Manager. It allows a user to add one or multiple recipes to their own internal library of recipes. 
Orders can be created from lists of recipes, but only from the recipes that you have access to.

The intent of this feature is for a user to be able to keep track of the recipes they like and to eventually quickly place online grocery orders for the ingredients required to cook a recipe. 
It should also help to efficiently manage the ingredients in one's pantry with the assumption that all meals will be chosen, bought and cooked for using the meal manager system. 
Therefore, the system should eventually be able to suggest orders based on things like "likely to have the ingredient in the pantry based on past orders and difference between quantity used vs quantity bought" as well as "has not been cooked in a while and was rated highly.

For this feature, we will be implimenting the data gathering side of things, where we just care about the recipe and its contents itself.

A recipe consists of:
* a name
* a description
* a list of ingredients required and the amounts that are required
    * Ingredients should be stored in a structured format (with separate fields for quantity, unit, and name) to enable easier searching in future features
* a list of required equipment, assume just a string for each piece of equipment for now such as a stand mixer, an oven, a stove, etc.
* as well as a series of meta attributes:.
    * vegetarian
    * vegan
    * dairy-free
    * nut-free
    * prep time
    * cook time
    * portion size
    * number of portions
    * protein per serving
    * fat per serving
    * carb per serving
* a set of cooking instructions (stored as a single block of text)

The user should be able to supply all of the above by hand, OR submit a URL with a link to the recipe.
There should be a toggle to submit either one or the other, and depending on the toggle's value will enable or disable controls on the page. 
An info box should be available above the toggle explaining this.

If the user submits a URL, then it should submit a job to a backend queue, in which an async process will attempt to crawl that exact URL for the recipe's content.
The system should validate the URL format and accessibility before adding it to the crawler queue. If the URL returns a non 2XX or 3XX HTTP status code, don't add it to the queue and inform the user it cannot be added at this time. The user should have the option to override this validation and force the URL to be added to the queue.

The crawler job will:
1. download a copy of that URL's HTML content, as well as any links, to a new folder in an s3 bucket, that is assigned to that user. There should be a crawl depth that is configurable via environment variable that will apply to the entire system. This crawl depth will go and download all content on the linked pages, up to that crawl depth. I.e. if the crawl depth is 0, then no content other than the initial HTML of the page would be downloaded. If the crawl depth is 1, it would download all content of all linked content on the initial page, but no more. If the crawl depth was 2, it would download all linked content from the initial page, as well as linked content on the downloaded linked content pages, but no more than that, etc. Hard code the crawl depth to be a maximum of 5. All content should be saved into a subfolder of the S3 object of that initial content with the same structure as it was downloaded from, so that the content can be loaded from an s3 presigned URL. Also, the content should scanned and any links to crawler sites should be removed, such as google tag manager.
  a. If at any point the job fails, it should update the job table with a status of either 'failed and retryable' or 'failed forever', along with a user error status code and an admin message explaining what happened to the job
  b. once the job succeeds, mark the job as 'success' in the table. The user should be able to view a list of the crawler jobs they have started. Once a job has completed, they should be able to marked 'archive', at which point the job will no longer appear in the table. A user should be able to check a toggle somewhere to display their own archived jobs. 
  c. job start time, finish time and last updated time should all be tracked within the table.
2. Once it's crawled and the job is completed, the user should be able to view the recipe, at which point they'll be able to see all the attributes listed above. At this point, if they populated the recipe via link, none of the attributes other than name and description would be filled out. All attributes should be editable though. When a user clicks on a URL link, they should warned that they're about to leave Meal Manager, and to accept any risks as their own. If they click accept on the modal, then a new tab opens with the URL. They should also be able to mark the link as dead. If the link is marked dead, they should then be able to view the crawled version of the website as hosted by mealmanager

### Additional Requirements

1. **User Interface Flow:**
   - After a crawler job is initiated, a user should see a popup with a link to a page detailing information about the crawling job. 
   - The job details page should display all information about the job, as well as buttons to pause, cancel, and restart the job when applicable (i.e., when the job has failed and is retryable).
   - Once the job completes (success or failure), the user should receive a notification popup at the top of their screen.
   - There should be a separate interface for viewing and managing crawler jobs.

2. **Data Storage and Architecture:**
   - The existing recipe table in the database will be used for storing recipes.
   - New tables will be needed for crawler jobs and related data.
   - The system will use RabbitMQ for the job queue and PostgreSQL as the relational database.

3. **URL Crawler Implementation:**
   - For the initial implementation, the crawler will simply store the crawled content but will not attempt to extract recipe information from it.
   - Future implementations will involve AI for parsing the recipe content, but this is out of scope for the current feature.
   - If the crawler can't identify recipe components, fields will be left blank for the user to fill in manually.
   - The crawler should respect robots.txt files.

4. **User Permissions:**
   - All recipes will be marked as private by default.
   - Users will not be able to override this setting in the current implementation.
   - Sharing functionality will be implemented in a future feature.
   - Recipes should be linked to the user who created them.
   - Administrators will have special access to all recipes.

5. **Validation Requirements:**
   - Recipe fields should have a maximum character limit of 50 unicode characters where appropriate.
   - No other specific validation requirements for recipe fields at this time.

6. **Integration with Other Features:**
   - This feature will integrate with the existing "Orders" functionality which already works with the recipes table.
   - A rating system for recipes will be implemented in a future feature to support the "rated highly" functionality mentioned.

7. **Additional Specifications:**
   - Ingredients will support both metric and imperial units.
   - Equipment should be selected from a predefined list to ensure consistency.
   - Rate limiting of 30 crawler jobs per hour per user should be implemented.
   - Recipe entry form should not include rich text formatting for cooking instructions.

## Implementation Plan

### 1. Database Schema Updates

#### 1.1 Recipe Table Enhancements
- Extend the existing `recipe` table with the following columns:
  - `sysuser_id` (FK to `sysuser.id`) - to track recipe ownership
  - `instructions` (TEXT) - for cooking instructions
  - `prep_time_minutes` (INT) - preparation time
  - `cook_time_minutes` (INT) - cooking time
  - `portion_size` (VARCHAR) - description of portion size
  - `portion_count` (INT) - number of portions
  - `is_vegetarian` (BOOLEAN)
  - `is_vegan` (BOOLEAN)
  - `is_dairy_free` (BOOLEAN)
  - `is_nut_free` (BOOLEAN)
  - `is_private` (BOOLEAN) - defaults to true
  - `is_link_dead` (BOOLEAN) - for URL recipes

#### 1.2 Ingredients System
- Create `ingredient` table (ingredients as independent entities):
  - `id` (PK)
  - `name` (VARCHAR) - ingredient name
  - `protein_per_100g` (DECIMAL) - nutritional info
  - `fat_per_100g` (DECIMAL) - nutritional info
  - `carbs_per_100g` (DECIMAL) - nutritional info
  - `calories_per_100g` (DECIMAL) - nutritional info
  - `food_group` (VARCHAR) - for categorization
  - `is_vegetarian` (BOOLEAN)
  - `is_vegan` (BOOLEAN)
  - `contains_dairy` (BOOLEAN)
  - `contains_nuts` (BOOLEAN)
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)

- Create `recipe_ingredient` table:
  - `id` (PK)
  - `recipe_id` (FK to `recipe.id`)
  - `ingredient_id` (FK to `ingredient.id`)
  - `quantity` (DECIMAL) - amount
  - `measurement_unit_id` (FK to `measurement_unit.id`)
  - `preparation_note` (VARCHAR, nullable) - e.g., "finely chopped"
  - `display_order` (INT) - for sorting in UI
  - Index on `recipe_id` and `ingredient_id` for efficient searches

#### 1.3 Other Supporting Tables
- Create `measurement_unit` table:
  - `id` (PK)
  - `name` (VARCHAR) - unit name
  - `abbreviation` (VARCHAR)
  - `system` (VARCHAR) - "metric" or "imperial"
  - `type` (VARCHAR) - "volume", "weight", "count", etc.
  - `conversion_factor` (DECIMAL) - for conversion to standard unit
  - `standard_measurement_unit_id` (FK to `measurement_unit.id`, nullable) - reference to base unit

- Create `equipment` table:
  - `id` (PK)
  - `name` (VARCHAR)
  - `description` (VARCHAR)
  - `category` (VARCHAR) - for grouping equipment types

- Create `recipe_equipment` table:
  - `id` (PK)
  - `recipe_id` (FK to `recipe.id`)
  - `equipment_id` (FK to `equipment.id`)

#### 1.4 Crawler Job Tables
- Create `crawler_job` table:
  - `id` (PK)
  - `sysuser_id` (FK to `sysuser.id`)
  - `recipe_id` (FK to `recipe.id`, nullable) - can be NULL if job fails
  - `url` (TEXT)
  - `status` (VARCHAR) - "pending", "in_progress", "success", "failed_retryable", "failed_forever"
  - `error_code` (VARCHAR) - user-friendly error code (including "robots_txt_blocked" as a possible value)
  - `error_message` (TEXT) - detailed error message for admin
  - `created_at` (TIMESTAMP)
  - `started_at` (TIMESTAMP)
  - `finished_at` (TIMESTAMP)
  - `last_updated_at` (TIMESTAMP)
  - `crawl_depth` (INT)
  - `is_archived` (BOOLEAN) - defaults to false

- Create `crawler_storage` table:
  - `id` (PK)
  - `crawler_job_id` (FK to `crawler_job.id`)
  - `s3_bucket_name` (VARCHAR)
  - `s3_folder_path` (TEXT)
  - `created_at` (TIMESTAMP)

#### 1.5 Indexes for Efficient Searching
- Add the following indexes:
  - `ingredient` table: index on `name` for text search
  - `recipe` table: indexes on `is_vegetarian`, `is_vegan`, `is_dairy_free`, `is_nut_free` for filtering
  - `recipe_ingredient`: composite index on `ingredient_id` and `recipe_id` for ingredient-based recipe searches
  - `crawler_job`: indexes on `sysuser_id` and `status` for filtering jobs

### 2. Backend Implementation

#### 2.1 API Endpoints
- Create/update the following REST endpoints:
  - `POST /api/recipes` - create new recipe (manual or URL-based)
  - `GET /api/recipes` - list recipes (with filtering)
  - `GET /api/recipes/{id}` - get recipe details
  - `PUT /api/recipes/{id}` - update recipe
  - `DELETE /api/recipes/{id}` - delete recipe
  - `GET /api/ingredients` - list ingredients (with search and filtering)
  - `POST /api/ingredients` - create new ingredient
  - `GET /api/ingredients/{id}` - get ingredient details
  - `PUT /api/ingredients/{id}` - update ingredient
  - `GET /api/equipment` - get list of equipment
  - `GET /api/units` - get list of measurement units
  - `GET /api/crawler-jobs` - list crawler jobs
  - `GET /api/crawler-jobs/{id}` - get job details
  - `PUT /api/crawler-jobs/{id}/action` - perform action (pause, cancel, restart)
  - `PUT /api/crawler-jobs/{id}/archive` - archive job
  - `GET /api/crawler-jobs/{id}/content` - get URL to view crawled content

#### 2.2 Service Layer
- Create/update the following services:
  - `RecipeService` - CRUD for recipes and related entities
  - `IngredientService` - manage ingredients repository
  - `RecipeNutritionService` - calculate nutritional info from ingredients
  - `EquipmentService` - manage equipment list
  - `CrawlerJobService` - manage crawler jobs
  - `CrawlerStorageService` - manage S3 storage for crawler content
  - `UrlValidationService` - validate URLs before crawling

#### 2.3 Recipe Search Implementation
- Create specialized search capabilities:
  - Search recipes by ingredient(s)
  - Filter recipes by dietary preferences
  - Calculate nutritional information on-the-fly based on ingredients
  - Search by prep/cook time ranges

#### 2.4 Crawler Implementation
- Create a crawler module with:
  - `WebCrawlerService` - main crawler logic
  - `RobotsTxtParser` - for respecting robots.txt
  - `S3StorageService` - for saving crawled content
  - `LinkFilterService` - to remove unwanted links (e.g., Google Tag Manager)

#### 2.5 RabbitMQ Integration
- Create message producers and consumers:
  - `CrawlerJobProducer` - sends crawler jobs to queue
  - `CrawlerJobConsumer` - processes crawler jobs from queue
  - Define message format for crawler jobs
  - Configure proper error handling and retry policies

#### 2.6 Rate Limiting
- Implement rate limiting for crawler jobs:
  - Track number of jobs submitted per user per hour
  - Enforce limit of 30 jobs per hour

### 3. Frontend Implementation

#### 3.1 Recipe Creation Page
- Update the existing recipe creation page:
  - Add toggle between manual entry and URL-based entry
  - Add info box explaining the toggle options
  - For manual entry:
    - Input fields for all recipe attributes
    - Searchable ingredient selector with quantity and unit inputs
    - Display calculated nutritional information based on ingredients
    - Dropdown for selecting equipment from predefined list
    - Checkbox inputs for meta attributes
    - Text area for cooking instructions
  - For URL-based entry:
    - URL input field
    - Validation feedback
    - Option to override validation

#### 3.2 Recipe View/Edit Page
- Create/update recipe view/edit page:
  - Display all recipe attributes
  - Display calculated nutritional information based on ingredients
  - Edit functionality for all fields
  - For URL-based recipes:
    - Warning modal when clicking external links
    - Option to mark link as dead
    - View crawled content when link is dead

#### 3.3 Ingredient Management
- Create ingredient management page:
  - Search and browse ingredients
  - Add new ingredients with nutritional information
  - Edit existing ingredients

#### 3.4 Crawler Job Management Page
- Create a crawler job management page:
  - Table of crawler jobs (using existing table component)
  - Filter options (status, date, etc.)
  - Toggle to show/hide archived jobs
  - Action buttons (pause, cancel, restart) for applicable jobs
  - Link to view crawled content

#### 3.5 Notifications
- Implement notification system:
  - Popup notification after job initiation
  - Popup notification when job completes
  - Link to job details page

### 4. Testing Plan

#### 4.1 Unit Tests
- Service layer tests
- Repository layer tests
- API controller tests
- Crawler component tests
- Nutritional calculation tests

#### 4.2 Integration Tests
- End-to-end recipe creation flow
- Ingredient search and selection
- Crawler job submission and processing
- RabbitMQ message handling
- S3 storage integration

#### 4.3 Performance Tests
- Recipe search performance
- URL validation response time
- Crawler job processing time
- Rate limiting enforcement
- Nutritional calculation performance

### 5. Deployment Plan

#### 5.1 Database Migrations
- Flyway migration scripts for schema updates
- Data migration for any existing recipes
- Seed data for common ingredients and measurement units

#### 5.2 Environment Configuration
- S3 bucket setup and permissions
- RabbitMQ configuration
- Environment variables for crawler settings (e.g., max crawl depth)

#### 5.3 Rollout Strategy
- Deploy database changes first
- Deploy backend services
- Deploy frontend components
- Monitor logs and performance metrics

### 6. Future Enhancements (Out of Scope for Initial Implementation)

- AI-powered recipe extraction from crawled content
- Recipe sharing functionality
- Rating system for recipes
- Enhanced ingredient management (substitutions, optional ingredients)
- Rich text formatting for cooking instructions
- Integration with shopping list/order functionality
- Ingredient inventory tracking
- Recipe scaling functionality

### 7. Timeline Estimate

| Phase | Task | Estimated Duration |
|-------|------|-------------------|
| 1 | Database Schema Updates | 1 week |
| 2 | Backend API Implementation | 2 weeks |
| 3 | Recipe & Ingredient Functionality | 2 weeks |
| 4 | Crawler Implementation | 2 weeks |
| 5 | RabbitMQ Integration | 1 week |
| 6 | Frontend Implementation | 3 weeks |
| 7 | Testing | 2 weeks |
| 8 | Deployment and Bug Fixes | 1 week |
| | **Total** | **14 weeks** |
