# Platforms reference

Read this when you prepare a post for a specific platform.

## Check the live rules first

- `integrationList` lists the connected channels. Each one has a platform, name, status, character limit and remaining posting capacity, plus two ids: `integrationId` (a number, for creating posts) and `id` (a uuid, used as `channelId` in the helpers).
- `integrationSchema`, called with the channel's `platform` value from `integrationList` (such as instagram or linkedin), returns the character limits, supported media and per-post settings schema.

These come from the server and are always current, so this file doesn't repeat them. Trust them over anything you remember about a platform.

## The 15 platforms

| Platform | What a post needs besides text and media |
|---|---|
| Facebook | Pages, groups and profiles can be connected |
| Instagram | |
| LinkedIn | Profiles and pages can be connected |
| X (Twitter) | |
| Threads | |
| Bluesky | |
| Mastodon | |
| YouTube | |
| Pinterest | A board: `listPinterestBoards`, or `createPinterestBoard` for a new one |
| Dribbble | |
| Google Business Profile | |
| Telegram | |
| Slack | A channel to post in: `listSlackChannels` |
| Discord | A channel to post in: `listDiscordChannels` |
| WordPress | A post type (`listWordPressPostTypes`), and optionally categories (`listWordPressCategories`) and tags (`listWordPressTags`) |

The helpers take the channel's uuid `id` as `channelId`, never its numeric `integrationId`.

`createPinterestBoard` creates a board on the user's real Pinterest account. It's public unless `privacy` is SECRET. Ask before creating one.

## Settings

- **One channel:** put the per-post settings in `settings`, using the fields from the channel's settings schema.
- **Several channels:** use `settingsByIntegration`, with each channel's `integrationId` written as a string, for example `{"12": {...}}`. A channel without an entry gets no settings.
- Put the chosen Pinterest board, Slack or Discord channel, or WordPress post type, categories and tags in the settings fields that the schema names.

## Media

- Attach images or videos with `mediaUrls`, which are public URLs such as media library URLs.
- RepeatPost converts, crops or compresses images to suit each channel, and lists what changed in `mediaFitted`.
- `mediaUpload` imports images, GIFs and short videos (up to 100 MB) from a public URL, or small files as base64.

## Approval and capacity

- A channel with approval rules returns `PENDING_APPROVAL` instead of `SCHEDULED`. Tell the user the post is waiting for approval.
- Check each channel's remaining posting capacity in `integrationList` before scheduling many posts.
