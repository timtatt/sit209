var addNums = (a, b) => {
	return a + b;
}

var addNums = (a, b) => a + b;

test('test addNums function', () => {
	expect(addNums(1, 2)).toBe(3);
});