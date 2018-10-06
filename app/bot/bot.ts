import { AIHelper } from '../helper/aiHelper';
import { Player, TileContent } from '../helper/interfaces';
import { Map } from '../helper/map';
import { Point } from '../helper/point';
import { randomIntFromInterval, ResearchClosestResource } from './randomizer';

export class Bot {
    protected playerInfo: Player;

    /**
     * Gets called before ExecuteTurn. This is where you get your bot's state.
     * @param  {Player} playerInfo Your bot's current state.
     * @returns void
     */
    public beforeTurn(playerInfo: Player): void {
        this.playerInfo = playerInfo;
    }
    /**
     * This is where you decide what action to take.
     * @param  {Map} map The gamemap.
     * @param  {Player[]} visiblePlayers The list of visible players.
     * @returns string The action to take(instanciate them with AIHelper)
     */
    public executeTurn(map: Map, visiblePlayers: Player[]): string {
        const resource = this.nextToResource(this.playerInfo.Position, map);
        if (resource) {
            return AIHelper.createCollectAction(resource);
        }
        ResearchClosestResource(map, this.playerInfo.Position);
        // Determine what action you want to take.
        return AIHelper.createMoveAction(randomIntFromInterval());
    }

    private nextToResource(position: Point, map: Map): Point | undefined {
        const attempts = [
            new Point(position.x - 1, 0),
            new Point(position.x + 1, 0),
            new Point(0, position.y - 1),
            new Point(0, position.y + 1),
        ];

        attempts.forEach((attempt) => {
            if (map.getTileAt(attempt) === TileContent.Resource) {
                return attempt;
            }
        });
        return;
    }

    /**
     * Gets called after executeTurn
     * @returns void
     */
    public afterTurn(): void { }
}
