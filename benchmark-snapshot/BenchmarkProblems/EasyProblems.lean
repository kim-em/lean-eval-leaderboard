import Mathlib

-- ANCHOR: two_plus_two
theorem two_plus_two_eq_four : (2 : Nat) + 2 = 4 := by
  sorry
-- ANCHOR_END: two_plus_two

-- ANCHOR: list_append_singleton_length
theorem list_append_singleton_length :
    (([1, 2] : List Nat).append [3]).length = 3 := by
  sorry
-- ANCHOR_END: list_append_singleton_length
