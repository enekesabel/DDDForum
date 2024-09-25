Feature: Registration
  As a new user,
  I want to register as a Member
  So that I can vote on posts, ask questions, and earn points for discounts.

  Scenario: Successful registration with marketing emails accepted
		Given I am a new user
		When I register with valid account details accepting marketing emails
		Then I should be granted access to my account
		And I should expect to receive marketing emails

  Scenario: Successful registration without marketing emails accepted
    Given I am a new user
		When I register with valid account details declining marketing emails
		Then I should be granted access to my account
		And I should not expect to receive marketing emails

  Scenario: Invalid or missing registration details
    Given I am a new user
    When I register with invalid account details
    Then I should see an error notifying me that my input is invalid
    And I should not have been sent access to account details

  Scenario: Account already created with email
    Given a set of users already created accounts
      | firstName | lastName | email             |
      | John      | Doe      | john@example.com  |
      | Alice     | Smith    | alice@example.com |
      | David     | Brown    | david@example.com |
    When new users attempt to register with those emails
    Then they should see an error notifying them that the account already exists
    And they should not have been sent access to account details