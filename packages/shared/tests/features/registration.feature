Feature: Registration
  As a new user,
  I want to register as a Member
  So that I can vote on posts, ask questions, and earn points for discounts.

  @frontend
  @e2e
  @unit
  @infra
  Scenario: Successful registration with marketing emails accepted
		Given I am a new user
		When I register with valid account details accepting marketing emails
		Then I should be granted access to my account
		And I should expect to receive marketing emails

  @e2e
  @unit
  @infra
  Scenario: Successful registration without marketing emails accepted
    Given I am a new user
		When I register with valid account details declining marketing emails
		Then I should be granted access to my account
		And I should not expect to receive marketing emails

  @frontend
  @e2e
  @unit
  @infra
  Scenario: Invalid or missing registration details
    Given I am a new user
    When I register with invalid account details
    Then I should see an error notifying me that my input is invalid
    And I should not have been sent access to account details
    
  @frontend
  @e2e
  @unit
  @infra
  Scenario: Account already created with email
    Given a set of users already created accounts
      | firstName | lastName | email             |
      | John      | Doe      | john@example.com  |
      | Alice     | Smith    | alice@example.com |
      | David     | Brown    | david@example.com |
    When new users attempt to register with those emails
    Then they should see an error notifying them that the account already exists
    And they should not have been sent access to account details

  @e2e
  @unit
  @infra
  Scenario: Username already taken
    Given a set of users have already created their accounts with valid details
      | firstName | lastName | username     | email              |
      | John      | Doe      | thechosenone | john1@example.com  |
      | Alice     | Smith    | chillblinton | alice2@example.com |
      | David     | Brown    | greenday     | david3@example.com |
    When new users attempt to register with already taken usernames
      | firstName | lastName | username     | email                 |
      | Bill      | Bob      | thechosenone | billy@billbob.com     |
      | Max       | Samson   | chillblinton | maxsamson@example.com |
      | Will      | Steff    | greenday     | willsteff@example.com |
    Then they see an error notifying them that the username has already been taken
    And they should not have been sent access to account details

