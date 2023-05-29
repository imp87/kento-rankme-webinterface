function openLink(endpoint) {
    window.location.href = endpoint;
}
function openPopup() {
    document.getElementById("popup").classList.remove("hidden");
}

// Schließen des Popups
function closePopup() {
    document.getElementById("popup").classList.add("hidden");
}

async function resetScore(steamid){
    const swalResult = await Swal.fire({
        title: 'Willst du wirklich deinen Score resetten?',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Ja',
        denyButtonText: `Nein`,
    });

    if (swalResult.isConfirmed) {
        const swalLoading = Swal.fire({
            title: 'Bitte warten...',
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            const response = await fetch('/reset/score/' + steamid, {
                method: 'POST',
            });

            if (response.ok) {
                swalLoading.close();
                await Swal.fire('Score erfolgreich resetted!', '', 'success').then(() => {
                    location.reload()
                });
            }else if (response.status === 429) {
                swalLoading.close();
                await Swal.fire('Du kannst nur alle <%= process.env.RESET_COOLDOWN %> Stunden deinen Score resetten.', '', 'error');
            }else if (response.status === 404) {
                swalLoading.close();
                await Swal.fire('Du hast noch nicht auf unserem Server gespielt!', '', 'error');
            }else {
                throw new Error('Unerwartete Antwort vom Server.');
            }
        } catch (error) {
            swalLoading.close();
            console.error(error);
            await Swal.fire('Es ist ein Fehler aufgetreten!', '', 'error');
        }
    } else if (swalResult.isDenied) {
        await Swal.fire('Changes are not saved', '', 'info');
    }
}


// Funktion, die eine Ladeanimation anzeigt, während ein API-Aufruf durchgeführt wird
async function fetchScore(steamid) {
    // Zeigt die Ladeanimation an
    Swal.fire({
        title: "Bitte warten...",
        text: "Daten werden geladen...",
        didOpen: () => {
            Swal.showLoading();
        },
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
    });

    try {
        const response = await fetch("push/score/" + steamid, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Schließt die Ladeanimation
        Swal.close();

        if (response.status === 200) {
            // Zeigt eine Erfolgsmeldung mit einem grünen Haken an
            Swal.fire("Du hast deinen Score erfolgreich gepusht!", "", "success").then(() => {
                location.reload();
            });
        } else if (response.status === 429) {
            // Zeigt eine Fehlermeldung mit einem roten X an
            Swal.fire("Fehler", "Du hast bereits gepusht! Bitte warte 24 Stunden.", "error")
        }else if (response.status === 404) {
            // Zeigt eine Fehlermeldung mit einem roten X an
            Swal.fire("Fehler", "Du hast noch nie auf unserem Server gespielt! Bitte spiele zuerst.", "error")
        }else if (response.status === 403) {
            // Zeigt eine Fehlermeldung mit einem roten X an
            Swal.fire("Fehler", "Funktion deaktiviert.", "error")
        } else {
            // Zeigt eine Fehlermeldung für andere HTTP-Statuscodes an
            Swal.fire("Fehler", "Beim Laden der Daten ist ein Fehler aufgetreten.", "error").then(() => {
                location.reload()
            });
        }
    } catch (error) {
        // Schließt die Ladeanimation und zeigt eine Fehlermeldung an
        Swal.close();
        Swal.fire("Fehler", "Beim Laden der Daten ist ein Fehler aufgetreten.", "error");
    }
}