async function getUserStats(username) {
    try {
        // Prepare request parameters
        const params = { discourseNames: [username] };
        const headers = { 'Content-type': 'application/json', 'Accept': 'text/plain' };
        const url = 'https://api.infiniteflight.com/public/v2/user/stats?apikey=nvo8c790hfa9q3duho2jhgd2jf8tgwqw';
        // Make the request
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(params),
            headers,
        });
        // Convert the response to JSON
        const { result: userStats } = await response.json();

        // Verifica se o array não é vazio e se o primeiro elemento possui a propriedade userId
        if (userStats && userStats[0] && userStats[0].userId) {
            // Get the user flights
            const userFlights = await getUserFlights(userStats[0].userId);
            return [userStats, userFlights];
        } else {
            // Exibe o alerta
            alert('Nome não encontrado');
        }
    } catch (error) {
        console.error(error);
    }
}


async function getUserFlights(userId) {
    try {
        // Build the API URL with the user ID
        const url = `https://api.infiniteflight.com/public/v2/users/${userId}/flights?apikey=nvo8c790hfa9q3duho2jhgd2jf8tgwqw`;
        // Make the request
        const response = await fetch(url);
        // Convert the response to JSON
        const { result: userFlights } = await response.json();
        return userFlights;
    } catch (error) {
        console.error(error);
    }
}

let aircraftCache = null;
async function getAircraft() {
    if (aircraftCache) {
        return aircraftCache;
    }
    try {
        const url = 'https://api.infiniteflight.com/public/v2/aircraft?apikey=nvo8c790hfa9q3duho2jhgd2jf8tgwqw';
        const response = await fetch(url);
        const { result } = await response.json();
        aircraftCache = result;
        return aircraftCache;
    } catch (error) {
        console.error(error);
    }
}


function formatTime(time) {
    const hours = Math.floor(time / 60);
    const minutes = Math.round((time / 60 - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

const form = document.querySelector('form');
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const input = document.getElementById('username');
    const username = input.value;
    input.value = '';  // Clear the input field

    // Limpa a tabela
    const table = document.getElementById('myTable');
    while (table.rows.length > 1) {
        table.deleteRow(table.rows.length - 1);
    }

    // Get the user stats and flights
    const [userStats, userFlights] = await getUserStats(username);
    const flights = userFlights.data;
    flights.sort((a, b) => new Date(b.created) - new Date(a.created));
    flights.forEach(async (flight) => {
        const table = document.getElementById('myTable');
        const row = table.insertRow();
        const cell1 = row.insertCell();
        const cell2 = row.insertCell();
        const cell3 = row.insertCell();
        const cell4 = row.insertCell();
        const cell5 = row.insertCell();
        const cell6 = row.insertCell();
        const cell7 = row.insertCell();
        const cell8 = row.insertCell();

        // Format the date
        const date = new Date(flight.created);
        const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

        // Format the total time
        // Format the time in hours and minutes
        const formattedDayTime = formatTime(flight.dayTime);
        const formattedNightTime = formatTime(flight.nightTime);
        const totalTime = formatTime(flight.totalTime);

        // Get the aircraft name
        const getAircraftName = async () => {
            const aircraft = await getAircraft();
            return aircraft.find((a) => a.id === flight.aircraftId).name;
        }

        const aircraftName = await getAircraftName();

        // Insert the data into the table
        cell1.innerHTML = formattedDate;
        cell2.innerHTML = aircraftName;
        cell3.innerHTML = flight.server;
        cell4.innerHTML = flight.originAirport;
        cell5.innerHTML = flight.destinationAirport;
        cell6.innerHTML = formattedDayTime;
        cell7.innerHTML = formattedNightTime;
        cell8.innerHTML = totalTime;
    });
});
