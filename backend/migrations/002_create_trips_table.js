/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('trips', function(table) {
    table.string('id', 50).primary();
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    
    // Origin location
    table.decimal('origin_lat', 10, 7).notNullable();
    table.decimal('origin_lng', 10, 7).notNullable();
    table.text('origin_address').notNullable();
    
    // Destination location
    table.decimal('destination_lat', 10, 7).notNullable();
    table.decimal('destination_lng', 10, 7).notNullable();
    table.text('destination_address').notNullable();
    
    // Route data
    table.json('route_data').notNullable();
    table.json('air_quality_data').defaultTo('[]');
    table.json('breathability_score').defaultTo('{}');
    table.enum('route_type', ['fastest', 'healthiest']).notNullable();
    
    // Trip metrics
    table.integer('distance_meters').defaultTo(0);
    table.integer('duration_seconds').defaultTo(0);
    table.integer('actual_distance_meters').nullable();
    table.integer('actual_duration_seconds').nullable();
    
    // Air quality metrics
    table.integer('average_aqi').defaultTo(0);
    table.integer('max_aqi').defaultTo(0);
    table.integer('min_aqi').defaultTo(0);
    
    // Trip status and tracking
    table.enum('status', ['planned', 'in_progress', 'completed', 'cancelled']).defaultTo('planned');
    table.json('health_actions').defaultTo('[]');
    table.text('notes').nullable();
    
    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('started_at').nullable();
    table.timestamp('completed_at').nullable();
    
    // Indexes
    table.index(['user_id']);
    table.index(['status']);
    table.index(['route_type']);
    table.index(['created_at']);
    table.index(['average_aqi']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('trips');
};
