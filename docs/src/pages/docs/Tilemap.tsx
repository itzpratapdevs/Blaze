import { CodeBlock } from '../../components/CodeBlock';

export default function TilemapPage() {
    return (
        <article className="docs-content">
            <h1>Tilemap</h1>
            <p className="lead">
                Create grid-based levels with the Tilemap component.
            </p>

            <h2>Basic Usage</h2>
            <CodeBlock code={`import { BlazeGame, Tilemap } from 'blaze-engine';

// 0 = empty, 1 = wall, 2 = coin
const levelData = [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 2, 0, 1],
    [1, 1, 1, 1, 1],
];

function Game() {
    return (
        <BlazeGame width={160} height={128}>
            <Tilemap
                tileSize={32}
                data={levelData}
                tiles={{
                    0: null,           // Empty (no image)
                    1: '/wall.png',    // Wall tile
                    2: '/coin.png',    // Coin tile
                }}
            />
        </BlazeGame>
    );
}`} />

            <h2>Tile Click Events</h2>
            <CodeBlock code={`<Tilemap
    tileSize={32}
    data={levelData}
    tiles={tileImages}
    onTileClick={(tileX, tileY, value) => {
        console.log(\`Clicked tile (\${tileX}, \${tileY}) = \${value}\`);
        // Collect coin, break block, etc.
    }}
/>`} />

            <h2>useTilemap Hook</h2>
            <p>Manipulate tilemaps programmatically:</p>
            <CodeBlock code={`function Level() {
    const [mapData, setMapData] = useState(initialMap);
    const tilemap = useTilemap(mapData, setMapData, 32);
    
    // Convert world position to tile position
    const tile = tilemap.worldToTile(player.x, player.y);
    
    // Check if tile is solid
    if (tilemap.isSolid(tile.x, tile.y)) {
        // Collision!
    }
    
    // Get tile value
    const tileValue = tilemap.getTile(tile.x, tile.y);
    
    // Remove a tile (e.g., collect coin)
    if (tileValue === 2) {
        tilemap.setTile(tile.x, tile.y, 0);
        addScore(10);
    }
    
    return <Tilemap data={mapData} ... />;
}`} />

            <h2>Tile Collision</h2>
            <CodeBlock code={`function Player() {
    const [x, setX] = useState(64);
    const [y, setY] = useState(64);
    
    useGameLoop((dt) => {
        let newX = x + velocityX * dt;
        let newY = y + velocityY * dt;
        
        // Check tile collision
        const tileX = Math.floor(newX / TILE_SIZE);
        const tileY = Math.floor(newY / TILE_SIZE);
        
        if (levelData[tileY]?.[tileX] === 1) {
            // Hit a wall - stop movement
            newX = x;
            newY = y;
        }
        
        setX(newX);
        setY(newY);
    });
}`} />

            <h2>Props Reference</h2>
            <table className="docs-table">
                <thead>
                    <tr>
                        <th>Prop</th>
                        <th>Type</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>tileSize</td><td>number</td><td>Size of each tile in pixels</td></tr>
                    <tr><td>data</td><td>number[][]</td><td>2D array of tile indices</td></tr>
                    <tr><td>tiles</td><td>Record&lt;number, string | null&gt;</td><td>Map of tile index to image URL</td></tr>
                    <tr><td>x</td><td>number</td><td>X offset (default: 0)</td></tr>
                    <tr><td>y</td><td>number</td><td>Y offset (default: 0)</td></tr>
                    <tr><td>opacity</td><td>number</td><td>Opacity (0-1)</td></tr>
                    <tr><td>onTileClick</td><td>function</td><td>Called when tile is clicked</td></tr>
                </tbody>
            </table>
        </article>
    );
}
