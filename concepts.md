# Queries don't return entity handles by default

Instead of something like:
```ts
query(Position).forEach((e, pos)) => { ... })
```

We'd have:
```ts
query(Entity, Position).forEach((e, pos) => { ... })
```

## Pros

- Queries that don't need the entity's handle don't have to omit it, like so:
 ```ts
 query(Name).forEach(name => { ... })
 ```
- Querying all (actual) entities reads nicely:
 ```ts
 query(Entity).forEach(e => { ... })
 ```

## Cons

- The way it reads is a bit confusing, since all queries query on entities.

# Events like so:

```ts
const DamageEvent = component<number>().set(ExpireOnRead)
const Poisoned = component<{ damage: 5 }>().set(ExpireAfterSecs, 6)
```

# Temporal ECS

Bevy has something like this, but it requires some heavy internal modifications.

```cpp
// Standard query gets the current frame's projection
auto current_positions = world.query<Position>();

// Temporal query retrieves the state of the world 15 ticks ago
auto past_positions = world.at_tick(current_tick - 15).query<Position>();

// Execute a rollback by simply truncating the temporal graph
world.rollback_to(current_tick - 15);
```

# Trait support for components

```ts
// Define a structural trait
trait DamageType { fn get_amount(&self) -> f32; }

// Register components that implement the trait
impl DamageType for FireDamage { ... }
impl DamageType for IceDamage { ... }

// Query requests ANY component fulfilling the category
fn process_damage(query: Query<&dyn DamageType>) {
    for damage in query.iter() { apply_reduction(damage.get_amount()); }
}
```
