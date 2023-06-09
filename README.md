# Kento RankMe Plugin Web Interface

**Note: This interface is currently in beta and under active development.**

This web interface, built with Node.js and Tailwind CSS, provides a user-friendly solution for managing leaderboards using the Kento RankMe Plugin.

## Installation

Follow these steps to install the web interface:

1. Run `npm install` to install the necessary dependencies.

2. Customize the `.env.example` files according to your requirements and change the name of the file to `.env`

3. Important: Execute the following SQL syntax on the same database where the rankme table is located:

```sql
CREATE TABLE IF NOT EXISTS `player_count` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `num_players` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=767 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `push_history` (
  `steam` varchar(255) DEFAULT NULL,
  `last_push_time` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

4. Start the application using `app.js`, for example, with [forever](https://github.com/foreversd/forever):

    ```bash
    npm install -g forever
    forever start --uid "Kento-Rankmeinterface" app.js
    ```

## Features

- Including use my API for get Server Information
- Players can push their score once a day (if enabled).
- Score reset for players every 24 hours (if enabled).
- Statistics of the number of players on CS:GO servers in the last 3 hours.
- Customized player statistics.
- Steam login integration.

## Future Updates

- Currently only in german avaiable. More languages coming in future.
- Addition of more features and improvements to enhance functionality and user experience.


## Usage

1. Access the web interface by visiting the appropriate URL in your web browser.

2. Use the interface to manage leaderboards, update player scores, view player statistics, and perform other administrative tasks.

## Support and Feedback

If you encounter any issues or have suggestions for improvements, please feel free to [report them](https://github.com/imp87/kento-rankme-webinterface/issues). We appreciate your feedback and will actively address any reported issues.

## License

This web interface is released under the GNU License. Please refer to the accompanying [LICENSE](https://www.gnu.org/licenses/gpl-3.0.html) file for more details.

I hope you enjoy using the Kento RankMe Plugin Web Interface! Thank you for your support.

Happy leaderboard management!
