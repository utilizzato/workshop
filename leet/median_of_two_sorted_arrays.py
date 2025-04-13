class Solution(object):
    def findMedianSortedArray(self, arr):
        n = len(arr)
        assert 1 <= n
        k = n // 2
        if n % 2: # n = 2k+1, indices 0...2k, need index k
            return arr[k]
        else: # n = 2k, indices 0...(2k-1), need indices k-1,k
            return (arr[k] + arr[k-1]) * 0.5


    def findMedianSortedArrays(self, nums1, nums2):
        # optimization for later, maybe
        #arr1_length = len(nums1)
        #arr2_length = len(nums2)
        #arr1_idx = arr2_idx = 0
        if len(nums1) <= len(nums2):
            arr1 = nums1
            arr2 = nums2
        else:
            arr1 = nums2
            arr2 = nums1
        assert len(arr1) <= len(arr2)

        if len(arr1) + 3 <= len(arr2):
            min_too_big_idx = 1 + (len(arr1) + len(arr2)) // 2
            num_too_big = len(arr2) - min_too_big_idx
            assert 0 < num_too_big
            arr2 = arr2[num_too_big:min_too_big_idx]

        while True:
            assert len(arr1) <= len(arr2) <= len(arr1) + 10
            if len(arr1) <= 20:
                combined_arr = arr1 + arr2
                sorted_combined_arr = sorted(combined_arr)
                return self.findMedianSortedArray(sorted_combined_arr)

            i1 = len(arr1) // 2
            i2 = len(arr2) // 2
            mid1 = arr1[i1]
            mid2 = arr2[i2]
            num_to_kill = i1-6
            assert 4 <= num_to_kill
            if mid1 <= mid2:
                arr1 = arr1[num_to_kill:]
                arr2 = arr2[:len(arr2)-num_to_kill]
            else:
                arr1 = arr1[:len(arr1)-num_to_kill]
                arr2 = arr2[num_to_kill:]

        