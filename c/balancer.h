#pragma once

#include "base_utils.h"

struct balancer_s;

// create a balancer instance
// num_participants assumed positive and at most 100, participant_ids assumed increasing
struct balancer_s* balancer_create(u64 num_participants, u64* participant_ids);

// destroy a balancer instance
void balancer_destroy(struct balancer_s* balancer_p);

// get a participants balance. positive if participant is owed, negative if participant is in debt. sum of balances of all participants is always 0 (a closed system).
i64 balancer_get_total_balance(struct balancer_s* balancer_p, u64 participant_id);

// get how much participant2 ows participant1. negative if debt is in the other direction. always returns the opposite number if participant inputs are swapped. dependent on implementation.
i64 balancer_get_balance_between_pair(struct balancer_s* balancer_p, u64 participant1_id, u64 participant2_id);

// add a debt of participant2 to participant1. negative if debt is in the other direction.
// for example, if 0xabc ows 100 to 0xdef, you can use add_balance(0xdef, 0xabc, 100), or alternatively use add_balance(0xabc, 0xdef, -100).
void balancer_add_balance_between_pair(struct balancer_s* balancer_p, u64 participant1_id, u64 participant2_id, i64 amount);

// implementation test
void balancer_test(void);
