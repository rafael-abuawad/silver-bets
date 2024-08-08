import pytest


@pytest.fixture(scope="module")
def sender(accounts):
    return accounts[0]


@pytest.fixture(scope="module")
def fee():
    return int(0.025e18)


@pytest.fixture(scope="module")
def silver_bet(project, fee, sender):
    return project.SilverBet.deploy(sender, fee, sender=sender)
