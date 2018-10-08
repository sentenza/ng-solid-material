# ng-solid-material

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.8.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

# Solid

**Solid** (derived from _"SOcial LInked Data"_) is a proposed set of conventions and tools for building **decentralized social
applications** based on Linked Data principles (**LDP**). 

Solid is a set of [modular and extensible specifications][solid-specs], which build on, and extend the founding technology of the world wide web (HTTP, REST, HTML). They are 100% backwards compatible with the existing web. Each spec, taken in isolation, provides extra features to an existing system.  However, when used in combination, they enable exciting new possibilities for web sites and applications.

The key principles at the base of this set of conventions - it's worth to repeat that concept to avoid any ambiguity - are basically 3:

## 1. True data ownership

Users should have the freedom to choose:

1. where their data resides,
2. who is allowed to access it.

By decoupling content from the application itself, users are now able to do so. 

**NOTE:** the fact that the application that we're going to build using solid have been defined as _decentralized social apps_ is probably misleading when we try to couple this aspect with the "data ownership". We have to go deeper in the net of conventions that defines Solid to be able to clarify what is the real meaning of "ownership" and how it could be possible to distribute our personal data at the same time.

## 2. Modular design

Because applications are decoupled from the data they produce, users will be able to **avoid vendor lock-in**, seamlessly switching between apps and personal data storage servers, without losing any data or social connections.

## 3. Reusing existing data

Developers will be able to easily innovate by creating new apps or improving current apps, all while **reusing existing data that was created by other apps**.

# How Solid works

The foundation of Solid is based on Linked Data, which is a very simple but powerful idea. Essentially each piece of information can be represented with **typed links** that connect a resource with another, each of which is **identified by a unique URL**. 

The first question here should be: "OK, that's interesting, but which URL should I use to identify a resource of mine?". To solve that Solid introduces the **"POD"** concept. We can describe it as you personal data space where you can put data and at the meantime define its permissions and its meaning (semantics). 

Since Solid represent things with Linked Data, it is useful if you’re able to read Linked Data documents. Linked Data is typically represented in **RDF, the Resource Description Framework**. RDF has different syntaxes, like Turtle or [JSON-LD][json-ld]. Here it is a minimal example using [JSON-LD][json-ld]:


```javascript
<script type="application/ld+json">{
  "@context": "http://schema.org",
  "@type": "Article",
  "author": "Author name",
  "datePublished": "2016-1-1",
  "headline": "Headline",
  "image": {
    "@type": "imageObject",
    "url": "http://example.com/images/image.png",
    "height": "600",
    "width": "800"
   },
  "publisher": {
    "@type": "Organization",
    "name": "Publisher name",
  "logo": {
    "@type": "imageObject",
    "url": "http://example.com/images/logo.png"
  }
}
}</script>
```

[solid-specs]: https://github.com/solid/solid-spec
[json-ld]: https://json-ld.org/
