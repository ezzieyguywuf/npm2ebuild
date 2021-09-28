This project will attempt to create an ebuild-generator for npm packages

Design
======

I'm going to try writing this in pure JavaScript - although I prefer writing in
TypeScript, I think the challenge of writting in pure JavaScript will help me
learn the language better.

Additionally, I wish to limit any dependencies in order to allow this package to
stand alone as much as possible. Unfortunately, this may make it difficult to
(easily) implement unit testing, but we'll see.

Usage
=====

After cloning the repository, the program can be run as follows:

```sh
./bin/main.js <package-name>
```

where `<package-name>` is a valid npm package such as `babel-core`.
