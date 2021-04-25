# League Tracker

To get it running:

`docker-compose up`
`docker-compose exec league-api bash`

Inside docker container:
`yarn prisma migrate dev`

Good to go!

To load the database up, run ingest script:
`yarn ingest`