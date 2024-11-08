Feature: Get User By Email
  As an administrator,
  I want to retrieve user details by their email address
  So that I can manage user accounts efficiently.

  @e2e
  @unit
  Scenario: Successfully retrieve user details by email
    Given a user exists with the email "test@example.com"
    When I request user details using the email "test@example.com"
    Then I should receive the user details

  @e2e
  @unit
  Scenario: User not found
    Given No user with email "nonexistent@example.com" exists
    When I request user details using the email "nonexistent@example.com"
    Then I should receive an error indicating that the user was not found

  @e2e
  Scenario: Not providing email
    When I request user details without providing an email
    Then I should receive an error indicating that was a client error