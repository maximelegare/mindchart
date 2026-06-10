// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from "./meta/_journal.json";
import m0000 from "./0000_damp_stone_men.sql";
import m0001 from "./0001_concerned_leader.sql";
import m0002 from "./0002_chubby_guardian.sql";
import m0003 from "./0003_puzzling_hitman.sql";
import m0004 from "./0004_mature_sinister_six.sql";
import m0005 from "./0005_glorious_sister_grimm.sql";

export default {
  journal,
  migrations: {
    m0000,
    m0001,
    m0002,
    m0003,
    m0004,
    m0005,
  },
};
