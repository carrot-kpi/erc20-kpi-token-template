## ERC20 KPI token template

A multiple ERC20 collateral, multiple weighted condition, minimum-payout-enabled
ERC20 KPI token template implementation.

This token template lets anyone create ERC20 tokens that can easily
be distributed via farming or airdrops, and that can be backed by multiple ERC20
collaterals (up to 5). Multiple weighted conditions (oracles) can be attached to
a single KPI token created using this template. An additional powerful feature
of the template regarding conditions is the ability to specify how the
conditions should behave related to one another (and as such, this logic really
only applies when 2 or more conditions are attached to a KPI token). In
particular we can have two scenarios as of now, with the current implementation:

- In the first scenario, all the conditions have to resolve positively (i.e.
  they need to either partially or fully reach their goal). In case even just
  one of the conditions resolves negatively, the collaterals locked in the KPI
  token are entirely sent back to the creator, while the ERC20 tokens
  distributed to the community expire worthless on the spot. As you can
  understand, this is a strict way of operating a KPI token campaign, where you
  require ALL goals to be at least partially reached in order to unlock even
  part of the collaterals (exclusive of any specified minimum payout which is
  paid out regardless).
- In the second scenario, conditions are judged in a vaccum. If one of a set of
  conditions fails, **JUST** the collaterals associated to that one condition
  (determined using the weighting logic) are sent back to the KPI token creator.
  The other conditions resolve normally and follow the same unlocking logic
  depending on the result communicated by the oracle.

As previously mentioned, minimum payout can also be specified per used
collateral, given out regardless of whether any of the goals is actually reached
or not. Using a weighting, it's also possible to assign a certain portion of the
collaterals to a condition that might be more important than others in a set. If
conditions weight is set the same for each specified conditions, collaterals
distribution related to the conditions is homogeneous. Let's check out an
example to better understand:

Let's say we have a KPI token created with 2 disjointed conditions A, B. In this
case, if condition A has a weight of 2 and B of 1, if A is reached, 2/3rds of
the collaterals will be redeemable by token holders. If condition B also
verifies, the remaining third of the collaterals will be redeemable by the KPI
token holders too, but if it fails, only that third gets sent back to the KPI
token creator. Redeeming the collateral will burn any held ERC20 KPI token.
