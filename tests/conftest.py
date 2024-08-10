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


@pytest.fixture(scope="module")
def token_images():
    return [
        "ipfs://QmT288DEAtEbtegcvChzhdYZ1ADSeT6yBCf7oihsiDN7Nu",
        "ipfs://Qmf21h2UV356dZFoyGvBRdtR7M8HFbfHbMZ2C2hrZzD4YK",
        "ipfs://QmY4jqGASdxh4JQpSaqgBckjWARYSJCBa638pGcnj6fozF",
        "ipfs://QmbUWo1LZRhK2Yc4UHQRKvnUVvESUdqqSFJAYDcTfJveZt",
        "ipfs://QmQ2qmaCm99nVT718B7hgb5eDQ1o2QmSKX1zJ99wpUGLXQ",
        "ipfs://QmdZHRXbayYcj7vukYUNakK9MUmKMD2rLmj1MgLrt2fEpC",
        "ipfs://QmVQeTT9ynSf1xQ7uhFsfyuwGcPYnqXwp2qxKJCPzw5Nci",
        "ipfs://QmQbovLGyvEZqUa5kqVDQCGhWsyNs8w3Q2JcnkLNxWfkJ2",
        "ipfs://QmVQj9M2qA7rob7rPcVP4uzqpq5HUMctrn7H9gWySJHV4T",
        "ipfs://QmeokY4SfwNtDMUcT9VZG5ngodj3GekAb6uEvXh8jgo621",
        "ipfs://QmRbrfpzPvCxoN2Xf7zt7oxL7gTUYaVtPEo6GDmdPaWegM",
        "ipfs://QmQQaQ3HhCckeusSwREWUAx6tBgGc8759s3uRHyA5geWWL",
    ]
