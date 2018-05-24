DROP SCHEMA IF EXISTS `bdnetwork` ;

CREATE SCHEMA IF NOT EXISTS `bdnetwork`;
USE `bdnetwork` ;

DROP TABLE IF EXISTS `bdnetwork`.`users` ;

CREATE TABLE IF NOT EXISTS `bdnetwork`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userName` VARCHAR(45) NOT NULL,
  `userPassword` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `firstName` VARCHAR(255) NOT NULL,
  `lastName` VARCHAR(255) NOT NULL,
  `birthday` DATE NOT NULL,
  `photo` VARCHAR(255),
  `userScore` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


DROP TABLE IF EXISTS `bdnetwork`.`communities` ;

CREATE TABLE IF NOT EXISTS `bdnetwork`.`communities` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `cName` VARCHAR(45) NOT NULL,
  `address` VARCHAR(255) NOT NULL DEFAULT 'Nowhere',
  `photo` VARCHAR(255),
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


DROP TABLE IF EXISTS `bdnetwork`.`events` ;

CREATE TABLE IF NOT EXISTS `bdnetwork`.`events` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `description` VARCHAR(255) NOT NULL,
  `date` DATE NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


DROP TABLE IF EXISTS `bdnetwork`.`posts` ;

CREATE TABLE IF NOT EXISTS `bdnetwork`.`posts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `content` TEXT NOT NULL,
  `priority` INT NOT NULL DEFAULT 0,
  `open` BINARY NOT NULL DEFAULT 0,
  `date` DATETIME NOT NULL,
  `end` DATETIME NOT NULL DEFAULT '2018-12-25',
  `communities_id` INT NOT NULL,
  `users_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_posts_communities1`
    FOREIGN KEY (`communities_id`)
    REFERENCES `bdnetwork`.`communities` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_posts_users1`
    FOREIGN KEY (`users_id`)
    REFERENCES `bdnetwork`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


DROP TABLE IF EXISTS `bdnetwork`.`comments` ;

CREATE TABLE IF NOT EXISTS `bdnetwork`.`comments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `text` VARCHAR(255) NOT NULL,
  `date` DATE NOT NULL,
  `users_id` INT NOT NULL,
  `posts_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_comments_users1`
    FOREIGN KEY (`users_id`)
    REFERENCES `bdnetwork`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_comments_posts1`
    FOREIGN KEY (`posts_id`)
    REFERENCES `bdnetwork`.`posts` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


DROP TABLE IF EXISTS `bdnetwork`.`accepts` ;

CREATE TABLE IF NOT EXISTS `bdnetwork`.`accepts` (
  `id` INT NOT NULL,
  `date` DATE NOT NULL,
  `accepted` INT NOT NULL DEFAULT 0,
  `users_id` INT NOT NULL,
  `posts_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_accepts_users1`
    FOREIGN KEY (`users_id`)
    REFERENCES `bdnetwork`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_accepts_posts1`
    FOREIGN KEY (`posts_id`)
    REFERENCES `bdnetwork`.`posts` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


DROP TABLE IF EXISTS `bdnetwork`.`chats` ;

CREATE TABLE IF NOT EXISTS `bdnetwork`.`chats` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `owner` INT NOT NULL,
  `participant` INT NOT NULL,
  PRIMARY KEY (`ID`))
ENGINE = InnoDB;


DROP TABLE IF EXISTS `bdnetwork`.`messages` ;

CREATE TABLE IF NOT EXISTS `bdnetwork`.`messages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `text` VARCHAR(255) NOT NULL,
  `users_id` INT NOT NULL,
  `chats_ID` INT NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_messages_users1`
    FOREIGN KEY (`users_id`)
    REFERENCES `bdnetwork`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_messages_chats1`
    FOREIGN KEY (`chats_ID`)
    REFERENCES `bdnetwork`.`chats` (`ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


DROP TABLE IF EXISTS `bdnetwork`.`communityUsers` ;

CREATE TABLE IF NOT EXISTS `bdnetwork`.`communityUsers` (
  `communityID` INT NOT NULL,
  `userID` INT NOT NULL,
  PRIMARY KEY (`communityID`, `userID`))
ENGINE = InnoDB;


DROP TABLE IF EXISTS `bdnetwork`.`communities_has_users` ;

CREATE TABLE IF NOT EXISTS `bdnetwork`.`communities_has_users` (
  `communities_id` INT NOT NULL,
  `users_id` INT NOT NULL,
  `role` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`communities_id`, `users_id`),
  CONSTRAINT `fk_communities_has_users_communities1`
    FOREIGN KEY (`communities_id`)
    REFERENCES `bdnetwork`.`communities` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_communities_has_users_users1`
    FOREIGN KEY (`users_id`)
    REFERENCES `bdnetwork`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


DROP TABLE IF EXISTS `bdnetwork`.`users_has_chats` ;

CREATE TABLE IF NOT EXISTS `bdnetwork`.`users_has_chats` (
  `users_id` INT NOT NULL,
  `chats_ID` INT NOT NULL,
  PRIMARY KEY (`users_id`, `chats_ID`),
  CONSTRAINT `fk_users_has_chats_users1`
    FOREIGN KEY (`users_id`)
    REFERENCES `bdnetwork`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_users_has_chats_chats1`
    FOREIGN KEY (`chats_ID`)
    REFERENCES `bdnetwork`.`chats` (`ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


DROP TABLE IF EXISTS `bdnetwork`.`users_has_events` ;

CREATE TABLE IF NOT EXISTS `bdnetwork`.`users_has_events` (
  `users_id` INT NOT NULL,
  `events_id` INT NOT NULL,
  PRIMARY KEY (`users_id`, `events_id`),
  CONSTRAINT `fk_users_has_events_users1`
    FOREIGN KEY (`users_id`)
    REFERENCES `bdnetwork`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_users_has_events_events1`
    FOREIGN KEY (`events_id`)
    REFERENCES `bdnetwork`.`events` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


DROP TABLE IF EXISTS `bdnetwork`.`communities_has_events` ;

CREATE TABLE IF NOT EXISTS `bdnetwork`.`communities_has_events` (
  `communities_id` INT NOT NULL,
  `events_id` INT NOT NULL,
  PRIMARY KEY (`communities_id`, `events_id`),
  CONSTRAINT `fk_communities_has_events_communities1`
    FOREIGN KEY (`communities_id`)
    REFERENCES `bdnetwork`.`communities` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_communities_has_events_events1`
    FOREIGN KEY (`events_id`)
    REFERENCES `bdnetwork`.`events` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `bdnetwork`.`requests` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `communities_id` INT NOT NULL,
  `users_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC),
  CONSTRAINT `fk_requests_communities`
    FOREIGN KEY (`communities_id`)
    REFERENCES `bdnetwork`.`communities` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_requests_users`
    FOREIGN KEY (`users_id`)
    REFERENCES `bdnetwork`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;
 
insert into bdnetwork.communities (cName, address) VALUES ('Community X', '24 de Outubro');
insert into bdnetwork.communities (cName, address) VALUES ('Building Y', 'Paulo Santos');
insert into bdnetwork.communities (cName, address) VALUES ('Condo Z', 'Antonio Damasio');