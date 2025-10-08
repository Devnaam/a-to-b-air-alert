/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('routes', function(table) {
    table.increments('id').primary();
    
    // Route endpoints
    table.decimal('origin_lat', 10, 7).notNullable();
    table.decimal('origin_lng', 10, 7).notNullable();
    table.decimal('destination_lat', 10, 7).notNullable();
    table.decimal('destination_lng', 10, 7).notNullable();
    
    // Route identifier and metrics
    table.string('route_hash', 64).notNullable().unique();
    table.integer('distance_meters').notNullable();
    table.integer('duration_seconds').notNullable();
    
    // Air quality data
    table.json('air_quality_data').defaultTo('[]');
    table.json('breathability_score').defaultTo('{}');
    
    // Usage tracking
    table.integer('usage_count').defaultTo(1);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['route_hash']);
    table.index(['usage_count']);
    table.index(['updated_at']);
    table.index(['origin_lat', 'origin_lng']);
    table.index(['destination_lat', 'destination_lng']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('routes');
};
