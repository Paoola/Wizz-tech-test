const express = require('express');
const db = require('../models');
const { getTop100Games } = require('../utils/game');
const router = express.Router();

router.get('/', (req, res) => {
    db.Game.findAll()
        .then(games => res.send(games))
        .catch(err => {
            console.error('Error fetching games:', err);
            res.status(500).send(err);
        });
});


router.post('/', (req, res) => {
    const { publisherId, name, platform, storeId, bundleId, appVersion, isPublished } = req.body;

    db.Game.create({ publisherId, name, platform, storeId, bundleId, appVersion, isPublished })
        .then(game => res.send(game))
        .catch(err => {
            console.error('Error creating game:', err);
            res.status(400).send(err);
        });
});


router.delete('/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (id <= 0 || !Number.isInteger(id)) {
        return res.status(400).json({ error: "Invalid ID. It must be a positive integer." });
    }

    try {
        const game = await db.Game.findByPk(id);
        if (!game) {
            return res.status(404).json({ error: "Game not found." });
        }

        await game.destroy({ force: true });
        res.json({ success: true, id });

    } catch (err) {
        console.error('Error deleting game:', err);
        res.status(500).json({ error: "An error occurred while deleting the game." });
    }
});


router.put('/:id', async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const game = await db.Game.findByPk(id);
        if (!game) return res.status(404).json({ error: "Game not found." });

        const updatedGame = await game.update(req.body);
        res.send(updatedGame);

    } catch (err) {
        console.error('Error updating game:', err);
        res.status(400).send(err);
    }
});


router.post('/search', (req, res) => {
    try {
        const { name, platform } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Please provide a game name to search." });
        }

        const whereClause = {
            name: db.Sequelize.where(
                db.Sequelize.fn('LOWER', db.Sequelize.col('name')),
                'LIKE',
                `%${name.toLowerCase()}%`
            )
        };

        if (platform && platform.trim() !== '' && platform.toLowerCase() !== 'all') {
            whereClause.platform = platform;
        }

        db.Game.findAll({ where: whereClause })
            .then(games => res.json(games))
            .catch(err => {
                console.error('Error searching games:', err);
                res.status(500).json({ error: 'Failed to search games', details: err.message });
            });

    } catch (err) {
        console.error('Unexpected error in search route:', err);
        res.status(500).json({ error: 'Unexpected error occurred', details: err.message });
    }
});


router.post('/populate', (req, res) => {
    try {
        Promise.all([
            getTop100Games('android'),
            getTop100Games('ios'),
        ])
            .then(([androidGames, iosGames]) => {
                const parsedGames = [...androidGames, ...iosGames].map(item => ({
                    publisherId: item.publisher_id,
                    name: item.name,
                    platform: item.os,
                    storeId: item.publisher_id || item.id || item.appId || item.app_id,
                    bundleId: item.bundle_id || item.id || item.appId || item.app_id,
                    appVersion: item.version,
                    isPublished: true
                }));

                db.Game.bulkCreate(parsedGames)
                    .then(() => {
                        console.log({ parsedGames });
                        res.status(200).json({ message: 'Games populated successfully', parsedGames });
                    })
                    .catch(dbErr => {
                        console.error('Error saving games to database:', dbErr);
                        res.status(500).json({ error: 'Failed to save games', details: dbErr.message });
                    });
            })
            .catch(fetchErr => {
                console.error('Error fetching games:', fetchErr);
                res.status(500).json({ error: 'Failed to fetch games', details: fetchErr.message });
            });

    } catch (err) {
        console.error('Unexpected error in populate route:', err);
        res.status(500).json({ error: 'Unexpected error occurred', details: err.message });
    }
});


module.exports = router;
