/**
 * CreateType - Used when creating a new entity (omits ID field)
 */
export type CreateType<T> = Omit<T, 'id'>;

/**
 * UpdateType - Used when updating an entity (makes all fields optional except ID)
 */
export type UpdateType<T> = Partial<Omit<T, 'id'>> & { id: number };

/**
 * DisplayType - Used when displaying an entity (all fields are readonly)
 */
export type DisplayType<T> = Readonly<T>;
