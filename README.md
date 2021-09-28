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

This will create a `dev-js` directory in the current directory, which will
contain an ebuild for the given package as well as all its dependencies.

Currently this tool does not generate manifests for these ebuilds, so you'll
need to use a tool such as `repoman` to generate manifests before you can merge
them.
