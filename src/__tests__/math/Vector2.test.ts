import { Vector2 } from '../../math/Vector2';

describe('Vector2', () => {
    describe('constructor', () => {
        it('should create a zero vector by default', () => {
            const v = new Vector2();
            expect(v.x).toBe(0);
            expect(v.y).toBe(0);
        });

        it('should create a vector with given values', () => {
            const v = new Vector2(3, 4);
            expect(v.x).toBe(3);
            expect(v.y).toBe(4);
        });
    });

    describe('magnitude', () => {
        it('should calculate correct magnitude', () => {
            const v = new Vector2(3, 4);
            expect(v.magnitude()).toBe(5);
        });

        it('should return 0 for zero vector', () => {
            const v = new Vector2();
            expect(v.magnitude()).toBe(0);
        });
    });

    describe('normalize', () => {
        it('should normalize vector to unit length', () => {
            const v = new Vector2(3, 4);
            v.normalize();
            expect(v.magnitude()).toBeCloseTo(1);
        });

        it('should handle zero vector', () => {
            const v = new Vector2();
            v.normalize();
            expect(v.x).toBe(0);
            expect(v.y).toBe(0);
        });
    });

    describe('add', () => {
        it('should add vectors correctly', () => {
            const v1 = new Vector2(1, 2);
            const v2 = new Vector2(3, 4);
            v1.add(v2);
            expect(v1.x).toBe(4);
            expect(v1.y).toBe(6);
        });
    });

    describe('subtract', () => {
        it('should subtract vectors correctly', () => {
            const v1 = new Vector2(5, 7);
            const v2 = new Vector2(2, 3);
            v1.subtract(v2);
            expect(v1.x).toBe(3);
            expect(v1.y).toBe(4);
        });
    });

    describe('multiply', () => {
        it('should multiply by scalar correctly', () => {
            const v = new Vector2(2, 3);
            v.multiply(2);
            expect(v.x).toBe(4);
            expect(v.y).toBe(6);
        });
    });

    describe('dot', () => {
        it('should calculate dot product correctly', () => {
            const v1 = new Vector2(1, 2);
            const v2 = new Vector2(3, 4);
            expect(v1.dot(v2)).toBe(11);
        });
    });

    describe('distance', () => {
        it('should calculate distance correctly', () => {
            const v1 = new Vector2(0, 0);
            const v2 = new Vector2(3, 4);
            expect(v1.distance(v2)).toBe(5);
        });
    });

    describe('clone', () => {
        it('should create independent copy', () => {
            const v1 = new Vector2(1, 2);
            const v2 = v1.clone();
            v1.x = 10;
            expect(v2.x).toBe(1);
        });
    });

    describe('static methods', () => {
        it('should add vectors statically', () => {
            const v1 = new Vector2(1, 2);
            const v2 = new Vector2(3, 4);
            const result = Vector2.add(v1, v2);
            expect(result.x).toBe(4);
            expect(result.y).toBe(6);
        });

        it('should create from angle', () => {
            const v = Vector2.fromAngle(0, 1);
            expect(v.x).toBeCloseTo(1);
            expect(v.y).toBeCloseTo(0);
        });
    });
});
