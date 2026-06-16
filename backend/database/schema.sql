-- ============================================================
-- AI Interview Preparation Platform - MySQL Schema
-- ============================================================
CREATE DATABASE IF NOT EXISTS interview_platform
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE interview_platform;

-- ------------------------------------------------------------
-- USERS
-- ------------------------------------------------------------
CREATE TABLE users (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(120)  NOT NULL,
    email           VARCHAR(150)  NOT NULL UNIQUE,
    password_hash   VARCHAR(255)  NOT NULL,
    target_role     VARCHAR(120)  DEFAULT NULL,      -- e.g. "Backend Developer"
    experience_level ENUM('fresher','1-2 years','3-5 years','5+ years') DEFAULT 'fresher',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- MOCK INTERVIEWS (text / voice, AI driven)
-- ------------------------------------------------------------
CREATE TABLE mock_interviews (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    role            VARCHAR(120) NOT NULL,
    mode            ENUM('text','voice') DEFAULT 'text',
    status          ENUM('in_progress','completed') DEFAULT 'in_progress',
    overall_score   DECIMAL(5,2) DEFAULT NULL,
    overall_feedback TEXT,
    started_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at    DATETIME DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE interview_qa (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    interview_id    INT NOT NULL,
    question_text   TEXT NOT NULL,
    answer_text     TEXT,
    ai_feedback     TEXT,
    score           DECIMAL(5,2) DEFAULT NULL,        -- 0-10
    sequence_no     INT NOT NULL,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (interview_id) REFERENCES mock_interviews(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- CODING / DSA PRACTICE
-- ------------------------------------------------------------
CREATE TABLE coding_questions (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(200) NOT NULL,
    description     TEXT NOT NULL,
    difficulty      ENUM('Easy','Medium','Hard') NOT NULL,
    category        VARCHAR(80) NOT NULL,              -- Arrays, DP, Graphs...
    sample_input    TEXT,
    sample_output   TEXT,
    constraints_text TEXT
);

CREATE TABLE coding_submissions (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    question_id     INT NOT NULL,
    language        VARCHAR(40) NOT NULL,
    code            TEXT NOT NULL,
    ai_feedback     TEXT,
    correctness_score DECIMAL(5,2) DEFAULT NULL,        -- 0-10
    efficiency_score DECIMAL(5,2) DEFAULT NULL,          -- 0-10
    verdict         ENUM('Accepted','Needs Improvement','Incorrect') DEFAULT NULL,
    submitted_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES coding_questions(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- BEHAVIORAL QUESTIONS
-- ------------------------------------------------------------
CREATE TABLE behavioral_questions (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    question_text   TEXT NOT NULL,
    category        VARCHAR(80) NOT NULL                -- Leadership, Conflict, Teamwork...
);

CREATE TABLE behavioral_responses (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    question_id     INT NOT NULL,
    response_text   TEXT NOT NULL,
    ai_feedback     TEXT,
    score           DECIMAL(5,2) DEFAULT NULL,            -- 0-10
    submitted_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES behavioral_questions(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- APTITUDE TESTS
-- ------------------------------------------------------------
CREATE TABLE aptitude_questions (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    question_text   TEXT NOT NULL,
    option_a        VARCHAR(255) NOT NULL,
    option_b        VARCHAR(255) NOT NULL,
    option_c        VARCHAR(255) NOT NULL,
    option_d        VARCHAR(255) NOT NULL,
    correct_option  ENUM('A','B','C','D') NOT NULL,
    category        VARCHAR(80) NOT NULL,                 -- Quant, Logical, Verbal
    difficulty      ENUM('Easy','Medium','Hard') DEFAULT 'Medium'
);

CREATE TABLE aptitude_attempts (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    total_questions INT NOT NULL,
    correct_answers INT NOT NULL,
    score_percent   DECIMAL(5,2) NOT NULL,
    time_taken_secs INT DEFAULT NULL,
    attempted_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE aptitude_attempt_answers (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    attempt_id      INT NOT NULL,
    question_id     INT NOT NULL,
    selected_option ENUM('A','B','C','D') DEFAULT NULL,
    is_correct      BOOLEAN NOT NULL,
    FOREIGN KEY (attempt_id) REFERENCES aptitude_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES aptitude_questions(id) ON DELETE CASCADE
);

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO behavioral_questions (question_text, category) VALUES
('Tell me about a time you faced a conflict with a teammate and how you resolved it.', 'Conflict'),
('Describe a situation where you had to meet a tight deadline.', 'Time Management'),
('Tell me about a time you took initiative on a project.', 'Leadership'),
('Describe a failure you experienced and what you learned from it.', 'Self Awareness'),
('Tell me about a time you had to convince others to see things your way.', 'Influence'),
('Describe a time you worked with a difficult team member.', 'Teamwork'),
('Why do you want to work at this company?', 'Motivation'),
('Where do you see yourself in five years?', 'Career Goals');

INSERT INTO coding_questions (title, description, difficulty, category, sample_input, sample_output, constraints_text) VALUES
('Two Sum', 'Given an array of integers and a target, return indices of the two numbers that add up to the target.', 'Easy', 'Arrays', '[2,7,11,15], target=9', '[0,1]', '2 <= nums.length <= 10^4'),
('Reverse Linked List', 'Reverse a singly linked list and return the new head.', 'Easy', 'Linked List', '1->2->3->4->5', '5->4->3->2->1', '0 <= nodes <= 5000'),
('Longest Substring Without Repeating Characters', 'Find the length of the longest substring without repeating characters.', 'Medium', 'Strings', '"abcabcbb"', '3', '0 <= s.length <= 5*10^4'),
('Number of Islands', 'Given a 2D grid of 1s (land) and 0s (water), count the number of islands.', 'Medium', 'Graphs', 'grid=[[1,1,0],[0,1,0],[0,0,1]]', '2', '1 <= rows, cols <= 300'),
('Merge K Sorted Lists', 'Merge k sorted linked lists into one sorted linked list.', 'Hard', 'Linked List', 'lists=[[1,4,5],[1,3,4],[2,6]]', '[1,1,2,3,4,4,5,6]', '0 <= k <= 10^4'),
('Longest Increasing Subsequence', 'Find the length of the longest strictly increasing subsequence.', 'Medium', 'Dynamic Programming', '[10,9,2,5,3,7,101,18]', '4', '1 <= nums.length <= 2500');

INSERT INTO aptitude_questions (question_text, option_a, option_b, option_c, option_d, correct_option, category, difficulty) VALUES
('A train travels 360 km in 4 hours. What is its speed in km/h?', '80', '90', '70', '100', 'B', 'Quant', 'Easy'),
('If 5 workers complete a task in 12 days, how many days will 10 workers take?', '24', '6', '12', '18', 'B', 'Quant', 'Easy'),
('Find the odd one out: 2, 5, 10, 17, 26, 37, 50, 64', '37', '50', '64', '26', 'C', 'Logical', 'Medium'),
('Choose the word most similar to "Eloquent"', 'Silent', 'Articulate', 'Confused', 'Awkward', 'B', 'Verbal', 'Easy'),
('A is the brother of B. B is the sister of C. C is the father of D. How is A related to D?', 'Uncle', 'Father', 'Brother', 'Grandfather', 'A', 'Logical', 'Medium'),
('What is 15% of 240?', '36', '32', '40', '24', 'A', 'Quant', 'Easy'),
('Complete the series: 3, 9, 27, 81, ?', '162', '243', '729', '108', 'B', 'Logical', 'Easy'),
('Choose the antonym of "Benevolent"', 'Kind', 'Generous', 'Malevolent', 'Caring', 'C', 'Verbal', 'Easy');
