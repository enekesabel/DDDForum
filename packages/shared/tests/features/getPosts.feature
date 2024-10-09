Feature: Get Posts
  As a user,
  I want to retrieve a list of posts
  So that I can see what others have shared.

  Scenario: Successfully retrieve posts sorted by recent
    Given There are posts in the system already
    When I request the list of posts
    Then I should receive the list of posts starting with the most recent

  Scenario: Fail to retrieve posts when sorting is not provided
    Given There are posts in the system already
    When I request the list of posts without specifying sorting
    Then I should receive a client error