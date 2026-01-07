import { AABB } from '../../collision/AABB';
import { Vector2 } from '../../math/Vector2';

describe('AABB', () => {
    describe('constructor', () => {
        it('should create with default values', () => {
            const aabb = new AABB();
            expect(aabb.min.x).toBe(0);
            expect(aabb.min.y).toBe(0);
            expect(aabb.max.x).toBe(0);
            expect(aabb.max.y).toBe(0);
        });

        it('should create with given values', () => {
            const aabb = new AABB(10, 20, 50, 60);
            expect(aabb.min.x).toBe(10);
            expect(aabb.min.y).toBe(20);
            expect(aabb.max.x).toBe(50);
            expect(aabb.max.y).toBe(60);
        });
    });

    describe('properties', () => {
        it('should calculate width correctly', () => {
            const aabb = new AABB(10, 20, 50, 60);
            expect(aabb.width).toBe(40);
        });

        it('should calculate height correctly', () => {
            const aabb = new AABB(10, 20, 50, 60);
            expect(aabb.height).toBe(40);
        });

        it('should calculate center correctly', () => {
            const aabb = new AABB(0, 0, 100, 100);
            const center = aabb.center();
            expect(center.x).toBe(50);
            expect(center.y).toBe(50);
        });
    });

    describe('intersects', () => {
        it('should detect intersection', () => {
            const a = new AABB(0, 0, 50, 50);
            const b = new AABB(25, 25, 75, 75);
            expect(a.intersects(b)).toBe(true);
        });

        it('should detect non-intersection', () => {
            const a = new AABB(0, 0, 50, 50);
            const b = new AABB(100, 100, 150, 150);
            expect(a.intersects(b)).toBe(false);
        });

        it('should handle edge touching', () => {
            const a = new AABB(0, 0, 50, 50);
            const b = new AABB(50, 0, 100, 50);
            expect(a.intersects(b)).toBe(false); // Edge touching = no intersection
        });
    });

    describe('contains', () => {
        it('should detect point inside', () => {
            const aabb = new AABB(0, 0, 100, 100);
            expect(aabb.contains(new Vector2(50, 50))).toBe(true);
        });

        it('should detect point outside', () => {
            const aabb = new AABB(0, 0, 100, 100);
            expect(aabb.contains(new Vector2(150, 50))).toBe(false);
        });

        it('should detect point on edge', () => {
            const aabb = new AABB(0, 0, 100, 100);
            expect(aabb.contains(new Vector2(0, 50))).toBe(true);
        });
    });

    describe('getMTV', () => {
        it('should return null for non-intersecting', () => {
            const a = new AABB(0, 0, 50, 50);
            const b = new AABB(100, 100, 150, 150);
            expect(a.getMTV(b)).toBeNull();
        });

        it('should return minimum translation vector', () => {
            const a = new AABB(0, 0, 50, 50);
            const b = new AABB(40, 0, 90, 50);
            const mtv = a.getMTV(b);
            expect(mtv).not.toBeNull();
            expect(mtv!.x).toBe(-10); // Move left by 10
            expect(mtv!.y).toBe(0);
        });
    });

    describe('fromPositionAndSize', () => {
        it('should create AABB from position and size', () => {
            const aabb = AABB.fromPositionAndSize(10, 20, 30, 40);
            expect(aabb.min.x).toBe(10);
            expect(aabb.min.y).toBe(20);
            expect(aabb.max.x).toBe(40);
            expect(aabb.max.y).toBe(60);
        });
    });
});
