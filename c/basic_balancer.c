#include "balancer.h"
#include "sorted_set.h"

#define BAD_ID 666
#define UNLIKELY_BALANCE 98989898

struct balancer_s
{
    struct sorted_set_s* map_participant_to_total_balance; // dictionary with keys = participants, values = total balance (per participant)
    struct sorted_set_s* map_participant_pair_to_balance; // dictionary with keys = participants pair, values = pair's balance. participant pair is sorted for space efficiency. if pair's balance is 0, no key is stored.
};

struct participant_balance_s
{
    u64 participant_id;
    i64 total_balance;
};

struct participant_pair_balance_s
{
    u64 participant1_id;
    u64 participant2_id;
    i64 pair_balance;
};

static bool is_match_participant_pair_balance(byte* a, byte* b)
{
    struct participant_pair_balance_s* tmp_a = ((struct participant_pair_balance_s*) a);
    struct participant_pair_balance_s* tmp_b = ((struct participant_pair_balance_s*) b);
    
    return (tmp_a->participant1_id == tmp_b->participant1_id) && (tmp_a->participant2_id == tmp_b->participant2_id);
}

static bool is_less_participant_pair_balance(byte* a, byte* b)
{
    struct participant_pair_balance_s* tmp_a = (struct participant_pair_balance_s*) a;
    struct participant_pair_balance_s* tmp_b = (struct participant_pair_balance_s*) b;
    
    return (tmp_a->participant1_id < tmp_b->participant1_id) || (tmp_a->participant1_id == tmp_b->participant1_id && tmp_a->participant2_id < tmp_b->participant2_id);
}

struct balancer_s* balancer_create(u64 num_participants, u64* participant_ids)
{
    struct balancer_s* ret;
    assert(0 < num_participants);
    assert(num_participants <= 100);
    for(u64 i = 1; i < num_participants; i += 1)
    {
        assert(participant_ids[i-1] < participant_ids[i]);
    }
    ret = malloc(sizeof(*ret));
    ret->map_participant_to_total_balance = sorted_set_create(sizeof(struct participant_balance_s), is_match_u64, is_less_u64);
    ret->map_participant_pair_to_balance = sorted_set_create(sizeof(struct participant_pair_balance_s), is_match_participant_pair_balance, is_less_participant_pair_balance);
    
    struct participant_balance_s tmp;
    u32 tmp2;
    for(u64 i = 0; i < num_participants; i += 1)
    {
        assert(BAD_ID != participant_ids[i]);
        tmp.participant_id = participant_ids[i];
        tmp.total_balance = 0;
        sorted_set_insert(ret->map_participant_to_total_balance, (byte*)(&tmp), &tmp2);
        assert(i + 1 == tmp2);
    }

    return ret;
}

void balancer_destroy(struct balancer_s* balancer_p)
{
    sorted_set_destroy(balancer_p->map_participant_to_total_balance);
    sorted_set_destroy(balancer_p->map_participant_pair_to_balance);
    free(balancer_p);
}

i64 balancer_get_total_balance(struct balancer_s* balancer_p, u64 participant_id)
{
    bool valid_id = false;
    struct participant_balance_s found = {BAD_ID, UNLIKELY_BALANCE};
    assert(BAD_ID != participant_id);
    valid_id = sorted_set_contains(balancer_p->map_participant_to_total_balance, (byte*)(&participant_id), (byte*)(&found), GORNISHT);
    assert(valid_id);
    assert(participant_id == found.participant_id);
    if(UNLIKELY_BALANCE == found.total_balance) {  assert(false);  } //todo handle unlikely
    return found.total_balance;
}

void balancer_add_to_total_balance(struct balancer_s* balancer_p, u64 participant_id, i64 amount)
{
    if(0 == amount) { return; }
    bool valid_id = false;
    struct participant_balance_s found = {BAD_ID, UNLIKELY_BALANCE};
    assert(BAD_ID != participant_id);
    valid_id = sorted_set_contains(balancer_p->map_participant_to_total_balance, (byte*)(&participant_id), (byte*)(&found), GORNISHT);
    assert(valid_id);
    assert(participant_id == found.participant_id);
    if(UNLIKELY_BALANCE == found.total_balance) {  assert(false);  } //todo handle unlikely
    found.total_balance += amount;
    sorted_set_insert(balancer_p->map_participant_to_total_balance, (byte*)(&found), GORNISHT);
}


i64 balancer_get_balance_between_ordered_pair(struct balancer_s* balancer_p, u64 participant1_id, u64 participant2_id)
{
    assert(participant1_id < participant2_id);
    
    struct participant_pair_balance_s kv = {participant1_id, participant2_id, UNLIKELY_BALANCE};

    bool found = sorted_set_contains(balancer_p->map_participant_pair_to_balance, (byte*)(&kv), (byte*)(&kv), GORNISHT);
    
    if(!found) { return 0; }
    
    if(UNLIKELY_BALANCE == kv.pair_balance) { assert(false); } // todo handle unlikely

    return kv.pair_balance;
}

void balancer_add_balance_between_ordered_pair(struct balancer_s* balancer_p, u64 participant1_id, u64 participant2_id, i64 amount)
{
    assert(participant1_id < participant2_id);

    balancer_add_to_total_balance(balancer_p, participant1_id, amount);
    balancer_add_to_total_balance(balancer_p, participant2_id, -amount);

    struct participant_pair_balance_s kv = {participant1_id, participant2_id, UNLIKELY_BALANCE};
    
    bool found = sorted_set_contains(balancer_p->map_participant_pair_to_balance, (byte*)(&kv), (byte*)(&kv), GORNISHT);
    
    if(!found) { kv.pair_balance = 0; }
    else if(UNLIKELY_BALANCE == kv.pair_balance) { assert(false); } // todo handle unlikely

    kv.pair_balance += amount;
    if(0 != kv.pair_balance) { sorted_set_insert(balancer_p->map_participant_pair_to_balance, (byte*)(&kv), GORNISHT); }
    else { sorted_set_remove(balancer_p->map_participant_pair_to_balance, (byte*)(&kv), GORNISHT); }
}

void validate_pair(struct balancer_s* balancer_p, u64 participant1_id, u64 participant2_id)
{
    assert(participant1_id != participant2_id);
    assert(sorted_set_contains(balancer_p->map_participant_to_total_balance, (byte*)(&participant1_id), GORNISHT, GORNISHT));
    assert(sorted_set_contains(balancer_p->map_participant_to_total_balance, (byte*)(&participant2_id), GORNISHT, GORNISHT));
}

i64 balancer_get_balance_between_pair(struct balancer_s* balancer_p, u64 participant1_id, u64 participant2_id)
{
    validate_pair(balancer_p, participant1_id, participant2_id);
    if(participant1_id < participant2_id)
        return balancer_get_balance_between_ordered_pair(balancer_p, participant1_id, participant2_id);
    else
        return -balancer_get_balance_between_ordered_pair(balancer_p, participant2_id, participant1_id);
}

void balancer_add_balance_between_pair(struct balancer_s* balancer_p, u64 participant1_id, u64 participant2_id, i64 amount)
{
    validate_pair(balancer_p, participant1_id, participant2_id);
    if(participant1_id < participant2_id)
        balancer_add_balance_between_ordered_pair(balancer_p, participant1_id, participant2_id, amount);
    else
        balancer_add_balance_between_ordered_pair(balancer_p, participant2_id, participant1_id, -amount);
}

void balancer_test(void)
{
    u64 num_participants = 5;
    u64 participant_ids[5] = {10, 20, 30, 40, 50};
    struct balancer_s* balancer_p = balancer_create(num_participants, participant_ids);
    for(u64 i = 10; i <= 50; i += 10)
    {
        assert(0 == balancer_get_total_balance(balancer_p, i));
    }
    balancer_add_balance_between_pair(balancer_p, 20, 10, 700);
    balancer_add_balance_between_pair(balancer_p, 10, 20, 100);
    balancer_add_balance_between_pair(balancer_p, 20, 10, 300);

    balancer_add_balance_between_pair(balancer_p, 20, 30, 400);


    for(u64 i = 10; i <= 50; i += 10)
    {
        for(u64 j = 10; j <= 50; j += 10)
        {
            if(i == j)
                continue;
            assert(i != j);
            i64 tmp = balancer_get_balance_between_pair(balancer_p, i, j);
            if(20 == i && 10 == j)
                assert(900 == tmp);
            else if(10 == i && 20 == j)
                assert(-900 == tmp);
            else if(20 == i && 30 == j)
                assert(400 == tmp);
            else if(30 == i && 20 == j)
                assert(-400 == tmp);
            else
                assert(0 == tmp);    
        }
    }
    for(u64 i = 10; i <= 50; i += 10)
    {
        i64 tmp = balancer_get_total_balance(balancer_p, i);
        if(10 == i)
            assert(-900 == tmp);
        else if(20 == i)
            assert(1300 == tmp);
        else if(30 == i)
            assert(-400 == tmp);
        else
            assert(0 == tmp);
    }

    printf("balancer test passed\n");
    balancer_destroy(balancer_p);
}
