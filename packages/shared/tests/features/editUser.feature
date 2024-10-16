Feature: Edit User
  As a registered user,
  I want to be able to edit my profile information
  So that I can keep my information up to date.

  @e2e
  @unit
  Scenario: Successful user edit
    Given I am a registered user
    When I try to update my user details using valid data
    Then my user details should be updated successfully
  
  @e2e
  Scenario: Invalid or missing user data
    Given I am a registered user
    When I try to update my user details using invalid data
    Then I should receive an error indicating the request was invalid
    And My user details shouldn't be updated

  @e2e
  @unit
  Scenario: User not found
    Given I am a registered user
    When I attempt to edit a user that does not exist
    Then I should receive an error indicating the user was not found
    
  @e2e
  @unit
  Scenario: Email already in use
    Given I am a registered user with email "test@example.com"
    And another user exists with email "another@example.com"
    When I attempt to update my email to "another@example.com"
    Then I should receive an error indicating the email is already in use

  @e2e
  @unit
  Scenario: Username already taken
    Given I am a registered user with username "testuser"
    And another user exists with username "anotheruser"
    When I attempt to update my username to "anotheruser"
    Then I should receive an error indicating the username is already taken
