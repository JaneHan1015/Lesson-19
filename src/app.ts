import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import { createMeeting, checkLogin, createPreferredTime, finalDecision, getMeetingInfo, changeMeeting } from "./db";

declare module "express-session" {
  interface SessionData {
    authenticated? boolean;
    user? {
      name: string,
      role:
    }
  }
}

const app = express();
const corsOptions = {
  origin: "*",
};
 
app.use(
  session({
  secret: 'veryverysecurecode',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 30000 },
})
);
app.use(bodyParser.json());
app.use(cors(corsOptions));

app.get("./hello", (req, res) => {
  //Do whatever you want
  return res.status(200).send({
    test: "gooood..",
  });
});

app.post("/createMeeting", (req, res) => {
  const meetingId = createMeeting(
    req.body.title,
    req.body.description,
    req.body.timezone,
    req.body.hostName,
    req.body.hostPreferredTime
  );
  return res.status(200).send({
    id: meetingId,
  });
});

app.get("/:meetingId/meetingInfo", (req, res) => {
  const meetingId = req.params.meetingId;
  const meetingInfo = getMeetingInfo(parseInt(meetingId));

  return res.status(200).send(meetingInfo);
});

app.post("/:meetingId/preferredTime", (req, res) => {
  const meetingId = req.params.meetingId;
  createPreferredTime(
    parseInt(meetingId),
    req.body.name,
    req.body.preferredTime
  );
  return res.status(201).send();
});

app.put("/:meetingId/changeMeeting", (req, res) => {
  const meetingId = req.params.meetingId;
  changeMeeting(
    parseInt(meetingId),
    req.body.title,
    req.body.description,
    req.body.timezone,
    req.body.hostName,
    req.body.hostPreferredTime
  );
  return res.status(200).send({
    id: meetingId,
  });
});

app.post("/:meetingId/finalDecision", (req, res) => {
  const meetingId = req.params.meetingId;
  finalDecision(parseInt(meetingId), req.body.decidedTime);
  return res.status(201).send();
});

app.post("/:meetingId/login", (req,rees) => {
  const meetingId = req.params.meetingId;
  const { user, password } = req.body;
  console.log(req.sessionID);
  if (user && password) {
    if (req.session.authenticated) {
      return resizeBy.status(201).send(req.session);
    } else {
      if (checkLogin(parseInt(meetingId), user, password)) {
        req.session.authenticated = true;
        req.session.user = {
          name: user,
          role: "host"
        };
        return res.status(201).send(req.session);
        return res.status(403).send({ error: "Bad authentication"});
      }
    } else {
      return res.status(403).send({ error: "Bad authentication"})
    }
    }

    if (checkLogin(parseInt(meetingId), user, password)) {
      req.session.authenticated = true;
      req.session.user = {
        name: user,
        role: "host"
      };
      return res.status(201).send(req.session);
      return res.status(403).send({ error: "Bad authentication"});
    }
  } else {
    return res.status(403).send({ error: "Bad authentication"})
  }
  // 3. Id, pw check -> In the DB?
  // 4. IF true -> create session -> return cookie
  // 5. If false -> return error
});

app.get("/checkAuthed", (req, res) => {
  if (req.session.authenticated == true) {
    return res.status(200).send({status: "Logged in!.  Good..."});
  } else {
    return res.status(403).send({ status: "Not logged in.  Too bad..."});
  }
})

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
