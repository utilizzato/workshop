# simulating a finite distribution in O(log n) time and in O(1) time 

import random
import math
import time

eps = 1e-5

def verify(distribution):
    assert abs(1 - sum(distribution)) < eps and min(distribution) > 0

# return first index of arr with value >= x, None if all are < x
def bin_search(arr, x):
    lo = 0
    hi = len(arr) - 1
    while True:
        if lo > hi:
            #assert lo == hi + 1
            return None
        if lo == hi:
            if arr[lo] < x:
                return None
            return lo        

        mid = (lo + hi) // 2
        #assert lo <= mid <= hi
        if arr[mid] >= x:
            hi = mid
        else:
            lo = mid + 1

def v1_pre(distribution):
    verify(distribution)
    a = []
    s = 0
    for p in distribution:
        s += p
        a.append(s)
    return a

def v1_draw(pre_out):
    x = random.random()
    return bin_search(pre_out, x)

def v2_pre(distribution):
    verify(distribution)
    n = len(distribution)
    qq = [(n * distribution[i], i) for i in range(n)]
    qq.sort()
    ber = []
    first_row = [None] * n
    second_row = [None] * n
    while len(qq) > 0:
        #print(f"so far:\n qq = {qq}\n ber = {ber}\n first_row = {first_row}\n second_row = {second_row}")
        assert len(qq) + len(ber) == n
        assert abs(sum([x[0] for x in qq]) - len(qq)) < eps
        qm, im = qq.pop(0)
        assert(qm <= 1)
        first_row[len(ber)] = im
        if qm < 1 - eps:
            qM, iM = qq.pop()
            assert(qM > 1)
            second_row[len(ber)] = iM
            qq.append((qM - (1 - qm), iM))
            qq.sort()
        ber.append(qm)

    #print(f"log: finished v2_pre with\nn={n}\nber={ber}\nfirst_row={first_row}\nsecond_row={second_row}")
    return n, ber, first_row, second_row

def v2_draw(pre_out):
    n, ber, first_row, second_row = pre_out
    i = math.floor(n * random.random())
    t = random.random()
    if t < ber[i]:
        return first_row[i]
    return second_row[i]

test_distribution_1 = [0.01, 0.02, 0.05, 0.07, 0.13, 0.15, 0.16, 0.18, 0.23]
test_distribution_2 = [0.4, 0.2, 0.1, 0.3]

def test(version, test_distribution = test_distribution_1, rounds = 5000000):
    print(f"test of version {version}:")
    if version == "v1":
        pre_func = v1_pre
        draw_func = v1_draw
    else:
        assert version == "v2"
        pre_func = v2_pre
        draw_func = v2_draw

    start = time.time()
    test_pre_out = pre_func(test_distribution)
    hist = [0] * len(test_distribution)
    for _ in range(rounds):
        i = draw_func(test_pre_out)
        hist[i] += 1
    hist = [j/rounds for j in hist]
    print(f"test_distribution = {test_distribution}")
    print(f"hist = {hist}")
    end = time.time()
    print(f"time = {end - start}")

test(version = "v1")
test(version = "v2")
