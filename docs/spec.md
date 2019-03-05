# Aphid Discord library spec

## Contents

+ [Aphid Discord library](#aphid-discord-library)
+ [Contents](#contents)
+ [Terminology](#terminology)
+ [Goals](#goals)
+ [Aphid client](#aphid-client)
  + [Loading commands](#loading-commands)
+ [Project structure](#project-structure)
  + [Modules](#modules)
  + [Services](#services)
+ [Dependency injection](#dependency-injection)
+ [Commands](#commands)
+ [Event listeners](#event-listeners)
+ [Formal definitions](#formal-definitions)
  + [Aphid client interface](#aphid-client-interface)
  + [Module decorator interface](#module-decorator-interface)
  + [Partial module decorator](#partial-module-decorator)
  + [Service decorator](#service-decorator)
  + [Command decorator interface](#command-decorator-interface)
  + [Parameter decorator interface](#parameter-decorator-interface)
  + [Range interface](#range-interface)
  + [Parameter kind enum](#parameter-kind-enum)
  + [Event listener decorator](#event-listener-decorator)
  + [Event enum](#event-enum)

## Terminology

Term | Meaning
--- | ---
Soft error | An error which is not fatal and should not halt execution of the program.
Fatal error | An error which should immediately terminate the program.

## Goals

The Aphid discord library aims to make heavy use of TypeScript decorators in order to streamline the development process of Discord bots.

Under the hood, Aphid uses Discord.js to do the hard work. The purpose of Aphid is to provide an API which should

+ Make use of TypeScript features. More specifically, decorators.
+ Be intuitive and easy to use.
+ Be a "batteries included" API.
+ Be tolerant of soft errors, but have a zero tolerance policy for undefined behaviour.

With these in mind, the Aphid library can be defined as follows.

## Aphid client

The `AphidClient` class is the main point of interaction for the Aphid Discord library. `AphidClient` extends the familiar Discord.js `Client` class, so anything which is available using the Discord.js client will be available when using an Aphid client.

The Aphid client defines several additional methods which can be used for Aphid specific functionality.

When constructing a new `AphidClient`, some configuration values must be provided.

```typescript
const aphidClient = new AphidClient({
  prefix: 'a!',
  author: 'tcrane',
});
```

### Loading commands

The Aphid client should provide a way to load modules and services. The module loading method should recursively explore a given folder in order to discover all of the modules and services.

```typescript
aphidClient.load('./commands').then(() => {
  console.log('Loaded commands');
  aphidClient.login(process.env.TOKEN);
}).catch((err) => {
  console.log('There was an error loading commands.');
  console.error(err);
  process.exit(1);
});
```

## Project structure

The Aphid library defines two concepts, "modules" and "services".

### Modules

Modules are classes which can be used to define commands and event listeners. Modules should be decorated with a [`@Module`](#module-decorator-interface) decorator which describes the module.

```typescript
@Module({
  name: 'Moderation',
  description: 'Commands for moderating the server.',
})
class ModerationModule {

}
```

There may come a time where a module contains a lot of commands, and it would be sensible to split these commands up between multiple different files. To define a command as part of a module, but from another file, the [`@PartialModule`](#partial-module-decorator) decorator can be used.

```typescript
@PartialModule(ModerationModule)
class BanModule {

}
```

From a functional standpoint, there should be no difference between defining a command inside of a partial module and defining a command inside of a module.

### Services

Services are classes which can be used to provide some kind of service to modules. Such services may include a database service, or a logging service. Service classes should be decorated with the [`@Service`](#service-decorator) decorator.

```typescript
@Service()
class DbService {

}
```

Service classes should be singleton classes by design.

## Dependency injection

The user should not have to manage service or module instances themselves, so a dependency injection system should be present in order to manage this task.

The DI system should be both simple and should provide rich error messages, should the situation occur. One such error situation may be that the service being injected is not decorated with the [`@Service`](#service-decorator) decorator, and therefore has no managed instance.

Dependencies should be specified in the constructor of the module in which they will be injected into.

```typescript
@Module({
  name: 'Moderation',
  description: 'Commands for moderating the server.',
})
class ModerationModule {
  constructor(private dbService: DbService) { }
}
```

Classes decorated with the [`@Service`](#service-decorator) decorator should be the only classes which can be injected as a dependency. Appropriate error messages should be raised if a non-service class is used as a dependency.

Services should also be able to utilize the DI system.

```typescript
@Service()
class DbService {
  constructor(private loggingService: LoggingService) {
    loggingService.log('Initialising DB service.');
  }
}
```

## Commands

Commands are methods of module classes. They should be decorated with the [`@Command`](#command-decorator-interface) decorator which describes the command.

All command methods should have the same parameters, and this should be enforced by the command decorator. A soft error should be raised if the parameters of a command method are incorrect.

The method signature of a command method should be the following.

```typescript
pingPong(client: AphidClient, message: Message, args: MessageArgs) {
  // ...
}
```

Where

+ `client: AphidClient` is the instance of the `AphidClient` which received the command.
+ `message: Message` is the Discord.js `Message` object which triggered the command.

and

+ `args: MessageArgs` is an object which contains the arguments which this command was invoked with.

The `args: MessageArgs` is an optional parameter, and may be omitted if the command has no parameters. If it is not omitted and the command has no parameters, an empty object literal (`{}`) will be passed as the argument.

The [`@Command`](#command-decorator-interface) decorator should be provided with information that describes the command, and how it can be invoked.

```typescript
@Command({
  name: 'Ping pong',
  trigger: ['ping', 'p'],
  description: 'Replies to the command with a "Pong!" message.',
})
pingPong(client: AphidClient, message: Message, args: MessageArgs) {
  // ...
}
```

Command parameters can be specified by decorating the command method with a [`@Parameter`](#parameter-decorator-interface) decorator. All [`@Parameter`](#parameter-decorator-interface) decorators should be declared after the [`@Command`](#command-decorator-interface) decorator has been declared. If a [`@Parameter`](#parameter-decorator-interface) appears before a [`@Command`](#command-decorator-interface), a soft error should be raised.

The [`@Parameter`](#parameter-decorator-interface) decorator can be used to describe the valid range of a parameter, as well as general information about the parameter.

```typescript
@Command({
  name: 'Mute',
  trigger: ['mute', 'm'],
  description: 'Mute a user for a period of time.',
  restrictTo: [Roles.Moderator],
})
@Parameter({
  name: 'time',
  description: 'The length of time to mute the user for.',
  kind: ParameterKind.Time,
  range: { from: '0', to: '1d' },
  required: true,
})
mute(client: AphidClient, message: Message, args: MessageArgs) {
  // ...
}
```

Assuming the parameter is required and the command was invoked correctly, `args` should be guaranteed to contain a property with the same name as the parameter. The `kind` of the parameter will determine the type of the value of that property.

## Event listeners

The other type of method which can be included in a module is an event listener method. An event listener method is decorated with the `@EventListener` decorator, and provides a way of attaching event listeners to the Discord.js client.

```typescript
@EventListener(Event.GuildMemberAdd)
onGuildMemberAdd(client: AphidClient, member: GuildMember) {
  // ...
}
```

Similarly to command methods, event listener methods should also have partially consistent parameters. All event listener methods should have a client as the first parameter, e.g.

```typescript
eventListener(client: AphidClient) {
  // ...
}
```

Where

+ `client: AphidClient` is the instance of the `AphidClient` for which the event was raised.

The rest of the method's parameters will depend on the type of event which is being listened to. It should be ensured that `client: AphidClient` is the first parameter of any event listener method, and a soft error should be thrown if it is not. All other parameters should have no checking performed on them, and should be passed to the method as `any`.

## Formal definitions

The code displayed in the examples throughout this specification are not designed to be exhaustive demonstrations of the API. This section of the specification properly defines some of the types used throughout this specification.

### Aphid client interface

This describes the object which is passed to the `AphidClient` constructor

```typescript
interface AphidClientOptions {
  /**
   * The prefix which is used to denote a command.
   */
  prefix: string;
  /**
   * The author of the bot. This is optional
   * and defaults to `undefined`.
   */
  author?: string;
}
```

### Module decorator interface

This describes the object which is passed to the [`@Module`](#module-decorator-interface) decorator.

```typescript
interface ModuleInfo {
  /**
   * The name of this module.
   */
  name: string;
  /**
   * A description of this module.
   */
  description: string;
  /**
   * An optional array of Role snowflakes. If this is provided, any command
   * which is part of this module will inherit these role restrictions.
   * The `restrictTo` property of the [`@Command`](#command-decorator-interface) decorator takes precedence.
   */
  restrictTo?: string[];
}
```

### Partial module decorator

The partial module decorator takes the type of the module which it is a part of as its parameter. For example if you have a module

```typescript
class MyModule {

}
```

Then a partial module decorator would have the type `MyModule` as its only parameter.

### Service decorator

The service decorator has no formal parameters.

### Command decorator interface

This describes the object which is passed to the [`@Command`](#command-decorator-interface) decorator.

```typescript
interface CommandInfo {
  /**
   * The name of this command
   */
  name: string;
  /**
   * A list of words which will trigger this command if used in a message.
   */
  trigger: string[];
  /**
   * A description of this command.
   */
  description: string;
  /**
   * An optional array of Role snowflakes. If this is provided,
   * the command will only be useable by users who have one of
   * the specified roles.
   */
  restrictTo?: string[];
}
```

### Parameter decorator interface

This describes the object which is passed to the [`@Parameter`](#parameter-decorator-interface) decorator.

```typescript
interface ParameterInfo {
  /**
   * The name of the parameter.
   */
  name: string;
  /**
   * A description of the parameter.
   */
  description: string;
  /**
   * The type of this parameter. @see ParameterKind for available types.
   */
  kind: ParameterKind;
  /**
   * An optional range to restrict the values of the parameter.
   * If this is not provided then the domain of values will be unbounded.
   */
  range?: Range;
  /**
   * An optional boolean to indicate whether or not this parameter is
   * required. This will default to true.
   */
  required?: boolean;
}
```

### Range interface

The range interface can be used to limit the domain of values which can be used for parameters.

```typescript
interface Range {
  /**
   * An optional inclusive lower bound for numbers and time values.
   * Defaults to `undefined`, which results in an unbounded lower value.
   * This will be ignored if the parameter's `kind` is `String`.
   */
  from?: number | string;
  /**
   * An optional inclusive upper bound for numbers and time values.
   * Defaults to `undefined`, which results in an unbounded upper value.
   * This will be ignored if the parameter's `kind` is `String`.
   */
  to?: number | string;
  /**
   * An optional regular expression with which to test strings. If the
   * expression does not accept the string, then it is considered an
   * invalid argument. Defaults to `undefined`, which results in an
   * unbounded domain of acceptable strings.
   * This will be ignored if the parameter's `kind` is `Number` or `Time`.
   */
  regex?: RegExp;
}
```

### Parameter kind enum

The parameter kind enum lists the types of values which can be used for parameters.

```typescript
enum ParameterKind {
  /**
   * A number. Any string which is a valid JavaScript number is valid.
   * Examples include: `43`, `23.10`, `0xff`, `0b110010` and `2.43e3`.
   */
  Number,
  /**
   * A string.
   */
  String,
  /**
   * A length of time. Values should be specified as whole numbers followed by
   * an indicator of the length of time. Valid indicators include
   *
   * + `s` - Seconds.
   * + `m` - Minutes.
   * + `h` - Hours.
   * + `d` - Days.
   *
   * Examples include: `30s`, `10m`, `1h`, `7d`,
   * but **not** `10.5s`, `0.5m`.
   */
  Time,
}
```

### Event listener decorator

The event listener decorator takes a value from the `Event` enum as its parameter.

### Event enum

The event enum lists the events which can be listened to using the `@EventListener` decorator.

```typescript
enum Event {
  ChannelCreate
  ChannelDelete
  ChannelPinsUpdate
  ChannelUpdate
  ClientUserGuildSettingsUpdate
  ClientUserSettingsUpdate
  Debug
  Disconnect
  EmojiCreate
  EmojiDelete
  EmojiUpdate
  Error
  GuildBanAdd
  GuildBanRemove
  GuildCreate
  GuildDelete
  GuildMemberAdd
  GuildMemberAvailable
  GuildMemberRemove
  GuildMembersChunk
  GuildMemberSpeaking
  GuildMemberUpdate
  GuildUnavailable
  GuildUpdate
  Message
  MessageDelete
  MessageDeleteBulk
  MessageReactionAdd
  MessageReactionRemove
  MessageReactionRemoveAll
  MessageUpdate
  PresenceUpdate
  RateLimit
  Ready
  Reconnecting
  Resume
  RoleCreate
  RoleDelete
  RoleUpdate
  TypingStart
  TypingStop
  UserNoteUpdate
  UserUpdate
  VoiceStateUpdate
  Warn
}
```
