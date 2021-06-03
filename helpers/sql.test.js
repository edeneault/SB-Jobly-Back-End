const { sqlForPartialUpdate } = require("./sql");


describe("sqlPartialUpdate function unit test", function () {
    test("returns expected with 1 data item", () => {
        const result = sqlForPartialUpdate(
            { field1: "value1" }, { field1: "field1", field2: "field2" }
        );
        console.log("test1 result:",result);
        expect(result).toEqual(
            {
                setCols: '"field1"=$1',
                values: ["value1"]
            }
        );
    });

    test("returns expected with 2 data items", () => {
        const result = sqlForPartialUpdate(
            { field1: "value1", field2: "value2" }, { field2: "field2" }
        );
        console.log("test2 result:",result);
        expect(result).toEqual(
            {
                setCols: '"field1"=$1, "field2"=$2',
                values: ["value1", "value2"]
            }
        );
    });
});