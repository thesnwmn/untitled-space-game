---
id: balance

npc:
  special_name_chance: 0.3

missions:
  board_count_min: 3
  board_count_max: 6
  mission_ttl_ms: 900000
  delivery_chance: 0.6
  delivery_base_reward: 200
  delivery_random_reward: 200
  supply_reward_margin: 0.4
  supply_random_reward: 150
  supply_requirements_min: 1
  supply_requirements_max: 2
  supply_qty_min: 1
  supply_qty_max: 4

trading:
  stock_count_min: 4
  stock_count_max: 6
  stock_qty_min: 1
  stock_qty_max: 8
  stock_ttl_ms: 120000

fuel:
  price_per_litre: 10
  consumption_per_ly: 5
  in_system_base_consumption_l: 4

reputation:
  level_unfriendly_min: -300
  level_neutral_min: -100
  level_friendly_min: 100
  level_liked_min: 300
  level_revered_min: 600
  points_min: -600
  points_max: 1000
  mission_delta_small: 25
  mission_delta_medium: 75
  mission_delta_large: 200
  mission_tier_medium_reward: 300
  mission_tier_large_reward: 600
  trade_modifier_hated: 1.20
  trade_modifier_unfriendly: 1.10
  trade_modifier_neutral: 1.00
  trade_modifier_friendly: 0.92
  trade_modifier_liked: 0.85
  trade_modifier_revered: 0.80
  rep_per_credit: 0.01
  max_rep_per_visit: 10
---
