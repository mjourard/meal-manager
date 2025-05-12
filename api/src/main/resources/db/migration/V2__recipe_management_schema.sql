-- Recipe Management Schema Updates

-- Enhance the existing recipe table with new columns
ALTER TABLE public.recipe 
    ADD COLUMN sysuser_id BIGINT,
    ADD COLUMN instructions TEXT,
    ADD COLUMN prep_time_minutes INTEGER,
    ADD COLUMN cook_time_minutes INTEGER,
    ADD COLUMN portion_size VARCHAR(50),
    ADD COLUMN portion_count INTEGER,
    ADD COLUMN is_vegetarian BOOLEAN DEFAULT FALSE NOT NULL,
    ADD COLUMN is_vegan BOOLEAN DEFAULT FALSE NOT NULL,
    ADD COLUMN is_dairy_free BOOLEAN DEFAULT FALSE NOT NULL,
    ADD COLUMN is_nut_free BOOLEAN DEFAULT FALSE NOT NULL,
    ADD COLUMN is_private BOOLEAN DEFAULT TRUE NOT NULL,
    ADD COLUMN is_link_dead BOOLEAN DEFAULT FALSE NOT NULL,
    ADD CONSTRAINT fk_recipe_sysuser FOREIGN KEY (sysuser_id) REFERENCES sysuser(id);

-- Create ingredient table 
CREATE TABLE public.ingredient (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    protein_per_100g DECIMAL(8,2),
    fat_per_100g DECIMAL(8,2),
    carbs_per_100g DECIMAL(8,2),
    calories_per_100g DECIMAL(8,2),
    food_group VARCHAR(50),
    is_vegetarian BOOLEAN DEFAULT FALSE NOT NULL,
    is_vegan BOOLEAN DEFAULT FALSE NOT NULL,
    contains_dairy BOOLEAN DEFAULT FALSE NOT NULL,
    contains_nuts BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create index on ingredient name for text search
CREATE INDEX idx_ingredient_name ON public.ingredient USING GIN (to_tsvector('english', name));

-- Create measurement_unit table
CREATE TABLE public.measurement_unit (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    abbreviation VARCHAR(10) NOT NULL,
    system VARCHAR(20) NOT NULL, -- "metric" or "imperial"
    type VARCHAR(20) NOT NULL, -- "volume", "weight", "count", etc.
    conversion_factor DECIMAL(12,6),
    standard_measurement_unit_id BIGINT,
    CONSTRAINT fk_measurement_unit_standard FOREIGN KEY (standard_measurement_unit_id) 
        REFERENCES measurement_unit(id)
);

-- Create equipment table
CREATE TABLE public.equipment (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    category VARCHAR(50)
);

-- Create recipe_ingredient junction table
CREATE TABLE public.recipe_ingredient (
    id BIGSERIAL PRIMARY KEY,
    recipe_id BIGINT NOT NULL,
    ingredient_id BIGINT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    measurement_unit_id BIGINT NOT NULL,
    preparation_note VARCHAR(100),
    display_order INTEGER NOT NULL,
    CONSTRAINT fk_recipe_ingredient_recipe FOREIGN KEY (recipe_id) 
        REFERENCES recipe(id) ON DELETE CASCADE,
    CONSTRAINT fk_recipe_ingredient_ingredient FOREIGN KEY (ingredient_id) 
        REFERENCES ingredient(id),
    CONSTRAINT fk_recipe_ingredient_unit FOREIGN KEY (measurement_unit_id) 
        REFERENCES measurement_unit(id)
);

-- Create index for efficient recipe-ingredient searches
CREATE INDEX idx_recipe_ingredient_recipe ON public.recipe_ingredient(recipe_id);
CREATE INDEX idx_recipe_ingredient_ingredient ON public.recipe_ingredient(ingredient_id);
CREATE INDEX idx_recipe_ingredient_combined ON public.recipe_ingredient(recipe_id, ingredient_id);

-- Create recipe_equipment junction table
CREATE TABLE public.recipe_equipment (
    id BIGSERIAL PRIMARY KEY,
    recipe_id BIGINT NOT NULL,
    equipment_id BIGINT NOT NULL,
    CONSTRAINT fk_recipe_equipment_recipe FOREIGN KEY (recipe_id) 
        REFERENCES recipe(id) ON DELETE CASCADE,
    CONSTRAINT fk_recipe_equipment_equipment FOREIGN KEY (equipment_id) 
        REFERENCES equipment(id)
);

-- Create indexes on recipe dietary flags for filtering
CREATE INDEX idx_recipe_dietary ON public.recipe(is_vegetarian, is_vegan, is_dairy_free, is_nut_free);
CREATE INDEX idx_recipe_owner ON public.recipe(sysuser_id);

-- Create crawler_job table
CREATE TABLE public.crawler_job (
    id BIGSERIAL PRIMARY KEY,
    sysuser_id BIGINT NOT NULL,
    recipe_id BIGINT,
    url TEXT NOT NULL,
    status VARCHAR(20) NOT NULL, -- "pending", "in_progress", "success", "failed_retryable", "failed_forever"
    error_code VARCHAR(50),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    started_at TIMESTAMP,
    finished_at TIMESTAMP,
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    crawl_depth INTEGER DEFAULT 1 NOT NULL,
    is_archived BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT fk_crawler_job_sysuser FOREIGN KEY (sysuser_id) 
        REFERENCES sysuser(id),
    CONSTRAINT fk_crawler_job_recipe FOREIGN KEY (recipe_id) 
        REFERENCES recipe(id)
);

-- Create crawler_storage table
CREATE TABLE public.crawler_storage (
    id BIGSERIAL PRIMARY KEY,
    crawler_job_id BIGINT NOT NULL,
    s3_bucket_name VARCHAR(100) NOT NULL,
    s3_folder_path TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_crawler_storage_job FOREIGN KEY (crawler_job_id) 
        REFERENCES crawler_job(id) ON DELETE CASCADE
);

-- Create indexes for crawler job searches
CREATE INDEX idx_crawler_job_sysuser ON public.crawler_job(sysuser_id);
CREATE INDEX idx_crawler_job_status ON public.crawler_job(status);
CREATE INDEX idx_crawler_job_archived ON public.crawler_job(is_archived);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at columns
CREATE TRIGGER ingredient_updated_at
BEFORE UPDATE ON public.ingredient
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some common measurement units for seeding
INSERT INTO public.measurement_unit (name, abbreviation, system, type) VALUES
('Gram', 'g', 'metric', 'weight'),
('Kilogram', 'kg', 'metric', 'weight'),
('Milligram', 'mg', 'metric', 'weight'),
('Milliliter', 'ml', 'metric', 'volume'),
('Liter', 'l', 'metric', 'volume'),
('Tablespoon', 'tbsp', 'imperial', 'volume'),
('Teaspoon', 'tsp', 'imperial', 'volume'),
('Cup', 'cup', 'imperial', 'volume'),
('Fluid Ounce', 'fl oz', 'imperial', 'volume'),
('Ounce', 'oz', 'imperial', 'weight'),
('Pound', 'lb', 'imperial', 'weight'),
('Piece', 'pc', 'universal', 'count'),
('Pinch', 'pinch', 'universal', 'count');

-- Update standard units and conversion factors
UPDATE public.measurement_unit SET standard_measurement_unit_id = (SELECT id FROM public.measurement_unit WHERE name = 'Gram'), conversion_factor = 1 WHERE name = 'Gram';
UPDATE public.measurement_unit SET standard_measurement_unit_id = (SELECT id FROM public.measurement_unit WHERE name = 'Gram'), conversion_factor = 1000 WHERE name = 'Kilogram';
UPDATE public.measurement_unit SET standard_measurement_unit_id = (SELECT id FROM public.measurement_unit WHERE name = 'Gram'), conversion_factor = 0.001 WHERE name = 'Milligram';
UPDATE public.measurement_unit SET standard_measurement_unit_id = (SELECT id FROM public.measurement_unit WHERE name = 'Milliliter'), conversion_factor = 1 WHERE name = 'Milliliter';
UPDATE public.measurement_unit SET standard_measurement_unit_id = (SELECT id FROM public.measurement_unit WHERE name = 'Milliliter'), conversion_factor = 1000 WHERE name = 'Liter';
UPDATE public.measurement_unit SET standard_measurement_unit_id = (SELECT id FROM public.measurement_unit WHERE name = 'Milliliter'), conversion_factor = 15 WHERE name = 'Tablespoon';
UPDATE public.measurement_unit SET standard_measurement_unit_id = (SELECT id FROM public.measurement_unit WHERE name = 'Milliliter'), conversion_factor = 5 WHERE name = 'Teaspoon';
UPDATE public.measurement_unit SET standard_measurement_unit_id = (SELECT id FROM public.measurement_unit WHERE name = 'Milliliter'), conversion_factor = 240 WHERE name = 'Cup';
UPDATE public.measurement_unit SET standard_measurement_unit_id = (SELECT id FROM public.measurement_unit WHERE name = 'Milliliter'), conversion_factor = 30 WHERE name = 'Fluid Ounce';
UPDATE public.measurement_unit SET standard_measurement_unit_id = (SELECT id FROM public.measurement_unit WHERE name = 'Gram'), conversion_factor = 28.35 WHERE name = 'Ounce';
UPDATE public.measurement_unit SET standard_measurement_unit_id = (SELECT id FROM public.measurement_unit WHERE name = 'Gram'), conversion_factor = 453.59 WHERE name = 'Pound';

-- Insert some common equipment
INSERT INTO public.equipment (name, category) VALUES
('Oven', 'Appliance'),
('Stovetop', 'Appliance'),
('Microwave', 'Appliance'),
('Blender', 'Small Appliance'),
('Food Processor', 'Small Appliance'),
('Stand Mixer', 'Small Appliance'),
('Hand Mixer', 'Small Appliance'),
('Knife', 'Utensil'),
('Cutting Board', 'Utensil'),
('Measuring Cups', 'Utensil'),
('Measuring Spoons', 'Utensil'),
('Mixing Bowl', 'Utensil'),
('Baking Sheet', 'Bakeware'),
('Baking Dish', 'Bakeware'),
('Cake Pan', 'Bakeware'),
('Muffin Tin', 'Bakeware'),
('Pot', 'Cookware'),
('Pan', 'Cookware'),
('Dutch Oven', 'Cookware'),
('Skillet', 'Cookware'); 