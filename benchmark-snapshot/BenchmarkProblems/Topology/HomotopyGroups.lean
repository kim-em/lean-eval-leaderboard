import Mathlib

-- ANCHOR: pi1_circle_mulEquiv_int
theorem pi1_circle_mulEquiv_int :
    Nonempty (HomotopyGroup.Pi 1 Circle (1 : Circle) ≃* Multiplicative ℤ) := by
  sorry
-- ANCHOR_END: pi1_circle_mulEquiv_int

-- ANCHOR: pi3_sphere_two_mulEquiv_int
theorem pi3_sphere_two_mulEquiv_int (x : Metric.sphere (0 : EuclideanSpace ℝ (Fin 3)) 1) :
    Nonempty
      (HomotopyGroup.Pi 3 (Metric.sphere (0 : EuclideanSpace ℝ (Fin 3)) 1) x ≃*
        Multiplicative ℤ) := by
  sorry
-- ANCHOR_END: pi3_sphere_two_mulEquiv_int

-- ANCHOR: pin_sphere_n_mulEquiv_int
theorem pin_sphere_n_mulEquiv_int (n : ℕ)
    (x : Metric.sphere (0 : EuclideanSpace ℝ (Fin (n + 2))) 1) :
    Nonempty
      (HomotopyGroup.Pi (n + 1) (Metric.sphere (0 : EuclideanSpace ℝ (Fin (n + 2))) 1) x ≃*
        Multiplicative ℤ) := by
  sorry
-- ANCHOR_END: pin_sphere_n_mulEquiv_int

-- ANCHOR: pi_succ_sphere_n_mulEquiv_zmod_two
theorem pi_succ_sphere_n_mulEquiv_zmod_two (n : ℕ) (hn : 3 ≤ n)
    (x : Metric.sphere (0 : EuclideanSpace ℝ (Fin (n + 1))) 1) :
    Nonempty
      (HomotopyGroup.Pi (n + 1) (Metric.sphere (0 : EuclideanSpace ℝ (Fin (n + 1))) 1) x ≃*
        Multiplicative (ZMod 2)) := by
  sorry
-- ANCHOR_END: pi_succ_sphere_n_mulEquiv_zmod_two
