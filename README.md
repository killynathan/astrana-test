# ADT Provider Notification

## Structure

- `backend/handlers` — logic for creating and reading notifications and adt events
- `backend/migrations` — migrations to set up db schema
- `backend/main.go` — backend entry point
- `frontend/src/common` — generic UI components to be used throughout the app
- `frontend/src/pages` — web pages

## Things I Didn't Get To

- Authentication (provider sign-in). We just hardcode provider id.
- Patient outreach capabilities allowing providers to take action and message the patient directly from our system.
- Sending push notifications (IOS, Android, text). I use dummy calls.
- After a notification is actioned, we persist that and show that as a pill.
- Storing patient contact info.
- Localization.
- Persisting & utilizing notification preferences. How this would be implemented is when an ADT comes in, we pull the providers preferences. If they opted in for "As they come", we will then pull up further preferences and decide if we should send a push notification or not. If the provider opted for daily summary, we will have jobs running at set times that will pull for new notifications per provider in the past 24 hours. If they detect new ones we will notify the provider.
- DB indices and pagination.

## Data Format

We have patients, providers, adt_events, & notifications. Notifications is what is displayed to the user and is sourced by adt_events as well as other events. This is so we uniformly handle all types of events. From my research adt_events is just one out of many kinds of events so I use a general notification assuming we want to handle more than just adt. In the database a notification will link to a provider and patient. When a provider loads the page, we pull just notifications linked to them. We use the linked patient id to pull additional patient information that can be helpful to the provider.

## Encryption

I used SQLite but we can use Postgres with full-disk encryption. For encryption in transit we can use a tool like Caddy for Go to create a web server that sits in front of the Go server to handle HTTPS and forward requests through. If we host on AWS or Azure can also utilize their managed services to handle HTTPS.

## Summary View

We can create a summary view page. This page will show a provider a daily or weekly high level summary of that date range and allow the provider to perform the appropriate actions in bulk. This is so the provider does not need to click through each individual notification.

## Notification Latency and Frequency

It is not necessary to ping providers within minutes. In fact due to relying on third party data brokers, we will likely receive the event an hour plus after it occurred. Furthermore, most providers will not want to be constantly pinged. Thus, our system provides two options: live updates and daily update. For live updates they can filter by patient risk and for daily update they can choose a morning or night summary notification.

## Scale

With the scale a few thousand events, providers, and patients, a single server should suffice.

## Handling Retries

For robust retry logic as the events come in we can put them in a queue the server pulls from. That way if the server is down or fails, the queue can continue tracking events that need to be handled. This also allows us to horizontally scale when needed. We can even add another queue in between the processing server and the actual notification server to ensure more reliability.

## Hard Coded Notification Text

This makes it hard to retroactively fix old records, but makes the notification schema simple as its meant to handle many types of events.

## Mobile

Notifications will be most impactful on mobile. I implemented the frontend on web but would be good to do this in an app as well.

## How to Tell if an ADT Event is a Dupe

I am assuming we can rely on messageId. It may be the case that we need something more sophisticated like a combination of multiple fields.

## Inbox vs Push Notification

I created two separate entities. A notification inbox contains all events of a provider's patients so they have full visibility even if they turn off push notifications. A push notification is how providers actually get pinged on their mobile device. If we want to support live notifications on the web app which I don't think is necessary we can utilize server sent events. The downside of this is we need compute resources dedicated to managing these connections. Since we don't need super low latency updates, we can utilize sparse polling.

## How to Track Patient Identity

I see a challenge in uniquely identifying patients in our system. A naive solution is to use a combination of (first_name, last_name, DOB) as this information will be readily available in most contexts. My understanding is MRN can actually differ hospital to hospital and network to network. So a patients may have many external_ids as we interact with various networks, hospitals, and protocols. Perhaps then we can have a table patient_external_ids that consist of patient_id, external_id, source and match against this.

## How Are We Intaking ADT Events

We are assuming this data is cleaned to a uniform format and that an external system will call our endpoint to insert ADT Events into our system.

## How Are We Linking Patients and Providers

In our use case we will simply have a single provider per patient. To support multiple providers per we can create a join table and loop through all providers and create notifications for them.

## Auditing

We can create a generic audit log table to track reads and writes to patient events.

## Patient Categorization & Tagging

We can create a tagging system to help providers categorize their patients. We can provide built in options like low, md, high risk. We can also allow providers to custom tags. We can even auto tag using our systems data and AI. For example if our system determines detects a patient may be at risk of diabetes, we can tag that patient appropriately. Then with these tags we can display them in the Inbox and allow for further notification filtering.
