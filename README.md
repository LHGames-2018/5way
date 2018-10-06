# Typescript sample

This project contains the base code needed to run a server for LHGames.

## Building and running

Run `npm run tsc` to build your code and then npm start to launch it. Do NOT modify the npm start script to build the code for you, as this will break when you push your code.

## What's next (does it work?)

The different types of actions you can instantiate are in the aiHelper.ts file.
These actions take a point as a parameter (the target position for the action)
   - StealAction
   - AttackAction
   - CollectAction
   - MoveAction

- HealAction doesn't take any parameters
- UpgradeAction takes the UpgradeType as a parameter.
- PurchaseAction takes a PurchasableItem as a parameter. You can only buy one of each item, except for HealthPotions, which don't have a limit.
