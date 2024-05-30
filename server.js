require('dotenv').config();
const express = require('express')
const app = express()
// const apiURL = ``
const PORT = process.env.PORT || 8000

// set the view engine..
app.set('view engine', 'ejs');

app.use(express.static('public'));

// A function to shuffle an array to get different values.
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); //random index in the array from 0 to i
        [array[i], array[j]] = [array[j], array[i]]; // swap those element's positions.
    }
}

app.get('/', (req, res) => {
    res.render('index', { plants: null, message: null })
})

// Get some plants data
app.get('/getPlants', async (req, res) => {
    // grab the data from the form by it's variables
    // This will give you a big js object with all the form data in it.
    const params = req.query
    const edible = params.edible === 'yes' ? '&edible=1' : ''
    const poisonous = params.pets_kids === 'yes' ? '&poisonous=0' : ''
    const cycle = params.lifespan === 'yes' ? '&cycle' + params.lifespan : ''
    const watering = params.water_schedule ? '&watering=' + params.water_schedule : ''
    const sunlight = params.sunlight ? '&sunlight=' + params.sunlight : ''

    const apiURL = `https://perenual.com/api/species-list?key=${process.env.API_KEY}&indoor=1` + edible + poisonous + cycle + watering + sunlight

    // try / catch to handle errors.
    try {
        // boilerplate. 
        console.log(apiURL)
        const response = await fetch(apiURL);
        const data = await response.json();

        // Specific for this API, to exclude paywalled data.
        const validData = data.data.filter(item =>
            !(item.cycle.includes('Upgrade') ||
                item.watering.includes('Upgrade') ||
                item.sunlight.includes('Upgrade')
            )
        )

        shuffleArray(validData)

        if (validData && validData.length > 0) {
            res.render('index', { plants: validData.slice(0, 3), message: null })
        } else {
            res.render('index', { plants: [], message: "Nothing found, please modify your selections and try again." })
        }


    } catch {
        console.error('Error:', error);
        res.render('index', { plants: [], message: "Internal Server Error." })
    }
})

app.listen(PORT, () => {
    console.log(`Server is connected, listening on port: ${PORT}`)
})