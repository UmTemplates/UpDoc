# Worktrees

UpDoc uses one git worktree, for documentation.

```
UpDoc/                     main working directory — code, on a feature branch
UpDoc/.worktrees/docs/     docs worktree — always on docs/site
```

Both are the same repository. Two folders, two branches, one `.git`.

## Why

Documentation does not get written because it always competes with in-flight
work for the same working directory. The thought arrives mid-feature, and
acting on it means stashing, switching branch, losing your place. So it waits,
and then it does not happen.

The worktree removes that. When something needs documenting, open the docs
worktree, write it, commit, push. The feature branch never moves. Nothing to
stash, nothing to switch.

It also means docs deploy the moment they are pushed, rather than waiting for a
feature branch to merge. Since docs are often written *before* the code they
describe, that matters.

## The rules

**1. Never edit `docs/` from the main working directory.**

The same files exist on `develop`. Editing them there puts the change on a code
feature branch, where it sits until that branch merges. Which is the friction
this exists to remove.

**2. Check the path before editing any docs file.**

If it is under `docs/`, it belongs in the worktree. The two folders look
identical in an editor — the path is the only thing that tells you where you
are.

**3. Commit and push docs changes as you make them.**

Do not batch. Push to `docs/site` and it deploys. A docs change sitting
uncommitted in the worktree has all the same problems as one sitting on a
feature branch.

**4. Docs that are genuinely part of a code change can stay with the code.**

If a source file and its reference page change together, keep them in the same
feature branch. The worktree is for documentation that stands alone, not a rule
that docs may never travel with code.

## Working in it

```bash
cd .worktrees/docs
# edit, commit, push — deploys on push
```

First time only, the worktree needs its own `node_modules`:

```bash
cd .worktrees/docs/docs
npm install
```

To preview locally:

```bash
cd .worktrees/docs/docs
npm run dev
```

## Keeping it current

`docs/site` is a permanent branch. It does not get deleted after merging.

It will drift from `develop` over time, since code lands on `develop` and docs
land on `docs/site`. That is fine — they are independent. If you want the docs
worktree to have current code alongside it, merge `develop` into `docs/site`.

```bash
cd .worktrees/docs
git merge develop
```

Docs changes flow the other way when convenient, but they do not have to. The
site deploys from `docs/site` directly.

## Deployment

`.github/workflows/docs.yml` builds and deploys on push to `develop`, `main` or
`docs/site`, whenever anything under `docs/` changes. All three publish to the
same GitHub Pages site.

Docs pushed to `docs/site` go live within a couple of minutes without touching
`develop` or `main`.

## Note for other projects

Sibling projects run two worktrees, for developer docs and an editor manual on
separate permanent branches, deployed to Cloudflare Pages. UpDoc has one public
docs site on GitHub Pages and needs only one worktree. Same idea, smaller
shape.
