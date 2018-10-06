import { AIHelper } from '../helper/aiHelper';
import { Player, TileContent, UpgradeType } from '../helper/interfaces';
import { Map } from '../helper/map';
import { Point } from '../helper/point';
import { randomIntFromInterval, researchClosestResource } from './randomizer';

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
        /*if (this.playerInfo.HouseLocation.x !== this.playerInfo.Position.x) {
            return AIHelper.createMoveAction(new Point(1, 0));
        }*/
              
        const upgradePlayer = this.upgrade();
        if (upgradePlayer) {
            return upgradePlayer;
        }
        if (this.isFullCapacity()) {
            return this.returnHome(map);
        }
        const resource = this.nextToResource(this.playerInfo.Position, map);
        console.log(this.playerInfo.CarryingCapacity);
        if (resource) {
            return AIHelper.createCollectAction(resource);
        }
       
        const executeNearestResource = this.thinkNearestResource(map);

        if (executeNearestResource) {
            return executeNearestResource;
        }
    
        // Determine what action you want to take.
        return AIHelper.createMoveAction(randomIntFromInterval());
    }

    private thinkNearestResource(map: Map): string | undefined {
        const closestResource = researchClosestResource(map, this.playerInfo.Position);
        console.log('closest', closestResource);
        if(!closestResource){
            return;
        }
        let move: Point;
        if (closestResource.x !== this.playerInfo.Position.x) {
            move = new Point((closestResource.x < this.playerInfo.Position.x) ? -1 : 1, 0);
        } else if (closestResource.y !== this.playerInfo.Position.y) {
            move = new Point(0, (closestResource.y < this.playerInfo.Position.y) ? -1 : 1);
        }
        if (map.getTileAt(this.addVectors(this.playerInfo.Position, move)) === TileContent.Wall) {
            return AIHelper.createAttackAction(move);
        }

        return AIHelper.createMoveAction(move);
    }

    private addVectors(point1: Point, point2: Point): Point {
        return new Point(point1.x + point2.x, point1.y + point2.y);
    }

    private nextToResource(position: Point, map: Map): Point | undefined {
        const attempts = [
            new Point(-1, 0),
            new Point(1, 0),
            new Point(0, -1),
            new Point(0, +1),
        ];

        for (let i = 0; i < attempts.length; i++) {
            const attempt = attempts[i];
            if (map.getTileAt(new Point(position.x + attempt.x, position.y + attempt.y)) === TileContent.Resource) {
                return attempt;
            }
        }
        return;
    }

    private isFullCapacity(): boolean { //Checking if the capacity is full
        return this.playerInfo.CarriedResources > (this.playerInfo.CarryingCapacity * 0.9);
    }

    private returnHome(map: Map): string {
        let move: Point;

        if (this.playerInfo.HouseLocation.x !== this.playerInfo.Position.x) {
            move = new Point((this.playerInfo.HouseLocation.x < this.playerInfo.Position.x) ? -1 : 1, 0);
        } else if (this.playerInfo.HouseLocation.y !== this.playerInfo.Position.y) {
            move = new Point(0, (this.playerInfo.HouseLocation.y < this.playerInfo.Position.y) ? -1 : 1);
        }

        if (map.getTileAt(this.addVectors(this.playerInfo.Position, move)) === TileContent.Wall) {
            return AIHelper.createAttackAction(move);
        }

        return AIHelper.createMoveAction(move);
    }

    private upgrade() {
        const upgradeList = [{ type: UpgradeType.CarryingCapacity, level: 1, cost: 10000 }, { type: UpgradeType.CarryingCapacity, level: 2, cost: 15000 },{ type: UpgradeType.CollectingSpeed, level: 1, cost: 10000 },{ type: UpgradeType.CollectingSpeed, level: 2, cost: 15000 },{ type: UpgradeType.Defence, level: 1, cost: 10000 }, { type: UpgradeType.AttackPower, level: 1, cost: 10000 }, { type: UpgradeType.MaximumHealth, level: 1, cost: 10000 }, { type: UpgradeType.CarryingCapacity, level: 3, cost: 20000 }, { type: UpgradeType.CollectingSpeed, level: 3, cost: 20000 }];
        if (((this.playerInfo.Position.x === this.playerInfo.HouseLocation.x) && (this.playerInfo.Position.y === this.playerInfo.HouseLocation.y))) {
            for (let i = 0; i < upgradeList.length; i++) {              
                if (this.playerInfo.TotalResources > upgradeList[i].cost) {
                    if (this.playerInfo.getUpgradeLevel(upgradeList[i].type) !== upgradeList[i].level) {
                        return AIHelper.createUpgradeAction(upgradeList[i].type);
                    }
                }
            }
        }
    }

    /**
     * Gets called after executeTurn
     * @returns void
     */
    public afterTurn(): void { }
}
