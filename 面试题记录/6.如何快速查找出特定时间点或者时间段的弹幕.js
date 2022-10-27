// 其实就是二分法

const arr = new Array(16).fill(null).map((it, index) => index + 1)

function binarySearch(arr, target) {
    let start = 0
    let end = arr.length - 1
    while(start < end) {
        const mid = Math.ceil((start + end) / 2)
        if (arr[mid] === target) {
            return mid
        } else if (arr[mid] > target) {
            end = mid - 1
        } else {
            start = mid + 1
        }
    }
    return -1
}

console.log(binarySearch(arr, 5));