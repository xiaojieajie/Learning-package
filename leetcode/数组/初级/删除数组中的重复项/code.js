var removeDuplicates = function(nums) {
  let count = 0;
  for (let right = 1; right < nums.length; right ++) {
    if (nums[right] === nums[right - 1]) {
      count ++;
   } else {
     nums[right - count] = nums[right]
   }
  }

  return nums.length - count
};

var arr = [0, 0, 1, 1, 1, 2, 2, 3, 4, 4, 5]
console.log(removeDuplicates(arr))
console.log(arr)
