# Aphid Discord library spec

## Contents

+ [Aphid Discord library](#aphid-discord-library)
+ [Contents](#contents)
+ [Terminology](#terminology)
+ [Goals](#goals)
+ [Project structure](#project-structure)
  + [Modules](#modules)
  + [Services](#services)
+ [Dependency injection](#dependency-injection)
+ [Commands](#commands)

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

## Project structure

The Aphid library defines two concepts, "modules" and "services".

### Modules

Modules are classes which can be used to define one more commands. Modules should be decorated with a `@Module` decorator which describes the module.

```typescript
@Module({
  name: 'Moderation',
  description: 'Commands for moderating the server.',
})
class ModerationModule {

}
```

There may come a time where a module contains a lot of commands, and it would be sensible to split these commands up between multiple different files. To define a command as part of a module, but from another file, the `@PartialModule` decorator can be used.

```typescript
@PartialModule(ModerationModule)
class BanModule {

}
```

From a functional standpoint, there should be no difference between defining a command inside of a partial module and defining a command inside of a module.

### Services

Services are classes which can be used to provide some kind of service to modules. Such services may include a database service, or a logging service. Service classes should be decorated with the `@Service` decorator.

```typescript
@Service()
class DbService {

}
```

Service classes should be singleton classes by design.

## Dependency injection

The user should not have to manage service or module instances themselves, so a dependency injection system should be present in order to manage this task.

The DI system should be both simple and should provide rich error messages, should the situation occur. One such error situation may be that the service being injected is not decorated with the `@Service` decorator, and therefore has no managed instance.

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

Classes decorated with the `@Service` decorator should be the only classes which can be injected as a dependency. Appropriate error messages should be raised if a non-service class is used as a dependency.

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

Commands are methods of module classes. They should be decorated with the `@Command` decorator which describes how the command.

All command methods should have the same parameters, and this should be enforced by the command decorator. A soft error should be raised.
