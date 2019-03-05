# Example bot

This document goes through the process of building an example bot using the Aphid library.

The purpose of this doc is to familiarise you with how the Aphid library looks and feels, and to demonstrate how to go about building a functional Discord bot.

In this example we will construct a simple bot that behaves as follows:

The bot's purpose is to record the number of messages sent by each user. The bot should be able to

+ Record when a user sends a message.
+ Display a user's score to them.
+ Display the leaderboard (top 10 users).

This example uses all of the core aspects of Aphid, which are commands, event listerners and services.

## The main file

The main file simply constructs a new aphid file and loads the commands. When the commands have loaded, the bot is logged in using the bot token stored in the environment variables.

```typescript
// src/index.ts

import { AphidClient } from 'aphid';
import * as path from 'path';

const client = new AphidClient({
  prefix: 'a!',
  author: 'tcrane',
});

client.on('error', (err) => {
  console.log(`Client error: ${err}`);
});

/**
 * our modules are located in src/modules/ so we
 * will load that folder.
 */
const modulePath = path.join(__dirname, 'modules');
client.load(modulePath).then(() => {
  // if we are successful, we can login.
  client.login(process.env.TOKEN);
}).catch((err) => {
  // if there is some error, just log it and bail.
  console.log('An error occurred while loading the modules.');
  console.error(err);
  process.exit(1);
});
```

This code will get the bot up and running, but we still need to construct the services and modules which the bot will utilize.

## The database service

We need a service that is responsible for storing the users scores. Since this is a simple example, we are just going to use an in-memory database.

```typescript
// src/services/db.service.ts

import { Service } from 'aphid';

@Service()
class DbService {
  /**
   * we will store our scores as a dictionary which uses
   * the user's id as a key, and their score as the value.
   */
  private scores: Map<string, number>;
  constructor() {
    this.scores = new Map();
  }

  getScore(userId: string): number {
    if (this.scores.has(userId)) {
      return this.scores.get(userId);
    } else {
      return 0;
    }
  }

  setScore(userId: string, score: number): void {
    this.scores.set(userId, score);
  }

  getTop10(): Array<[string, number]> {
    const allScores = [...this.scores];
    return allScores
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }
}
```

The database service is now finished. It is simple, but will do just fine for this example.

## The scores module

Next, we will create the scores module which will contain the commands and event listeners related to the score keeping. We will put this file in the `src/modules` directory, since that's where our client is loading modules from.

```typescript
// src/modules/scores.module.ts

import { Module, Command, EventListener, Event, AphidClient, MessageArgs } from 'aphid';
import { Message } from 'discord.js';

@Module({
  name: 'Scores',
  description: 'Commands for viewing your current score and the leaderboard of players.',
})
class ScoresModule {
  /**
   * we need to use the database service, so we can
   * provide it as a parameter property
   */
  constructor(private dbService: DbService) { }

  /**
   * we need to know when someone sends a message, which
   * we can use an event listener method to do. We want to
   * listen for the 'message' event.
   */
  @EventListener(Event.Message)
  onMessage(client: AphidClient, message: Message) {
    // increment the users score by 1.
    const currentScore = this.dbService.getScore(message.author.id);
    this.dbService.setScore(message.author.id, currentScore + 1);
  }

  /**
   * next we will define the command someone can use to get their own score.
   * this command has no arguments, so we can omit the `args: MessageArgs` parameter.
   */
  @Command({
    name: 'My score',
    trigger: ['myscore'],
    description: 'Gets the score for a user',
  })
  myScore(client: AphidClient, message: Message) {
    const myScore = this.dbService.getScore(message.author.id);
    message.channel.send(`${message.author.tag} has a score of ${myScore}!`);
  }

  /**
   * the other command which we need is a way to display the top 10 users.
   */
  @Command({
    name: 'Leaderboard',
    trigger: ['leaderboard', 'top10'],
    description: 'Displays the top 10 users.',
  })
  leaderboard(client: AphidClient, message: Message) {
    const top10 = this.dbService.getTop10();
    const message = top10
      .map(([userId, score]) => `${userId}: ${score}`)
      .join('\n');
    message.channel.send(`The top 10 users are:\n${message}`);
  }
}
```

The bot is now done. Users should be able to send the message

```no-lang
a!myscore
```

in order to invoke the `myScore` method and display their score, and they can use

```no-lang
a!leaderboard
```

or

```no-lang
a!top10
```

To display the top 10 users.
