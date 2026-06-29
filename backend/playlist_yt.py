import webbrowser
from difflib import get_close_matches


class Playlist:

    playlist = {
        "believer": "https://youtu.be/7wtfhZwyrcc?si=zSwOeF50FdwChGKD",
        "roja": "https://youtu.be/BEThzQxWmEM?si=GLiOEt39PdVoBnx_",
        "sol vibra": "https://youtu.be/Ct7-hZIFBOw?si=RIscuYvd4svxLrJF",
        "abnormal": "https://youtu.be/8dOMXfWmghg?si=s_BDHv1CQe9YomU9",
        "heavenly": "https://youtu.be/WA3ckKYXQwk?si=FW0Fib2m1H3OpDx4",
        "control": "https://youtu.be/zEQIAszYYJk?si=JTs7M9xJELnZHQf6",
        "pegadora": "https://youtu.be/zEQIAszYYJk?si=JTs7M9xJELnZHQf6"
    }

    def play_song(self, song):
        match = get_close_matches(song.lower(), self.playlist.keys(), n=1, cutoff=0.5)

        if match:
            webbrowser.open(self.playlist[match[0]])
            return (
                "found",
                f"Sure Sir, I found '{match[0]}' matching '{song}'."
            )

        return (
            "not_found",
            f"Sorry Sir, I couldn't find '{song}' in your playlist."
        )


if __name__ == "__main__":
    command = input("Input command: ")
    play = Playlist()
    print(play.play_song(command))