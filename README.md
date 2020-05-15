# Eventbrite Source Function
This function is built to ingest event registrations from Eventbrite into Segment. 

## Setup
### Segment Setup
1. To set up this function, copy and paste the code into a new Source Function within the Segment app. While still editing the function, within the Settings tab of the right-hand panel,add a new Setting with a label of "Private Token" and a Name of "privateToken". 
2. Within the Segment App, go to Catalog --> Functions, select your newly created function, and use it to create a new Source. Save the webhook URL of the Source Function (it will start with "https://fn.segmentapis.com") as you will need to plug this into Eventbrite shortly


### Eventbrite Setup
**Create an API Token**
Login to Eventbrite, and go to Account Settings --> API Tokens (https://www.eventbrite.com/account-settings/apps) and create a new applicaiton. Copy and paste the "Private Key" into the Source in the Segment App (Settings --> Connection).

**Create the Webhook**
Within Account Settings in Eventbrite, go to "Webhooks" (https://www.eventbrite.com/account-settings/webhooks"). Note that you will have to have at least one Event and one API Key created in your Eventbrite account before you have access to Webhooks.
Click "Add Webhook", paste in the Source Function URL into "Payload URL" and check "order.placed" and "order.refunded". Checking additional options will not affect the Source Function, as they will be ignored.

You're all set up! When ticket orders or refunds come in, you will see events in the debugger.

## Details

### What this source listens for
This source listens for Ticket Purchases and Ticket Refunds, corresponding to the order.placed and order.refunded Eventbrite Webhooks, respectively. https://www.eventbrite.com/platform/docs/webhooks

### Outbound Events
If Segment recieves an order.placed webhook, the Source function will emit an Identify call and a "Ticket Ordered" Track event.
If Segment recieves an order.refunded webhook, the Source function will emit an Identify call and a "Ticket Refunded" Track event.
The following traits are included in the Track events:
* **event_id** - The ID Eventbrite generates for its events
* **event_name** - The title of the event, inputted on creation in Eventbrite
* **event_id** - The ID Eventbrite generates for its events
* **revenue** - The total amount the user paid for the ticket, include any fees or taxes
* **costs** - A breakdown of all the associated costs in an order, that sum to revenue. https://www.eventbrite.com/platform/api#/reference/order

The follow information is included in the Identify Calls:
* **anonymousId** - Use btoa, the anonymousId is the hashed email address included on the order
* **email** - The email address associated withh the order
* **name** - The first and last name on the order.
