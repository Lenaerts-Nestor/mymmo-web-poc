### flow:

1: user logs in and apears on the zone. the zones are displayed while the toggle option of show unread zones slowly apears like we currently have .
2: user can decide either to click on the zone and go to their conversation page or go to inbox to see all the unread messages from all the zones.
3: incase user decide to click on the zone, they will be redirected to the conversation page where they can see all the unread messages from that particular zone.
4: on the page conversation the user sees the conversations of that zones, he sees the unread conversations and the readed conversations like we have currently [no changes needed].
5: user can click on a message to open the message in a separate page. [currently the messaging and chatting works perfectly and need little to no changes]

6: incase the is on zone and decide to go to inbox, they wil see all the unread messages from all the zones.
7: when the user clicks on that conversation in inbox page, they wil be redirected directly to the chat page , where they can chat with the user . so an redirect directly to the chat page.

## aproacht:

- u wil first analyze all the context and providers , u wil do an extensive research about the current implementation.
- check the flow of the current implementation and see if it fits the new requirements.
- is it possible to simplify the current implementation regarding the inbox page and zone page? they seem to use the same context and providers and as u saw it is not an good idea on issolating with each its own context. because they are calling almost the same data and such.

## request:

- find out how we can improve the current issue regarding the inbox and zone page . find out when we fetch zones , can we get the unread threads in the same call and ofcours display it on the inbox page directly. and stil show the unread zones as it should ?

- find out if the socket alreadry giving us a thread details, and not just count.
- are we over contextualizing simple UI state.

- can we simplify the current context hell that we have without breaking the current functionality?
