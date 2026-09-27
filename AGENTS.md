# Technical decisions

- Save public house-programme requests through the browser's publishable client to `contact_messages`, relying on its existing public INSERT policy; this avoids deployment-dependent privileged server keys while keeping reads admin-only.