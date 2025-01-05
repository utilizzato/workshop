#include "stdio.h"
#include "base_utils.h"

// experimenting with Barry Jay's tree calculus

int COUNT_1 = 0, COUNT_2 = 0, COUNT_3 = 0, COUNT_4 = 0, COUNT_5 = 0;

enum tree_type
{
    LEAF,
    STEM,
    FORK
};

struct stem_s
{
    enum tree_type type;
    byte* left;
};

struct fork_s
{
    enum tree_type type;
    byte* left;
    byte* right;
};

byte* tree_create_leaf() { return GORNISHT; }

// output is now the owner of input, destroying input should only happen via destroying output
byte* tree_create_stem(byte* left)
{
    struct stem_s* ret = malloc(sizeof(*ret));
    ret->type = STEM;
    ret->left = left;
    return (byte*) ret;
}

// output is now the owner of inputs, destroying inputs should only happen via destroying output
byte* tree_create_fork(byte* left, byte* right)
{
    struct fork_s* ret = malloc(sizeof(*ret));
    ret->type = FORK;
    ret->left = left;
    ret->right = right;
    return (byte*) ret;
}

enum tree_type tree_get_type(byte* tree_p)
{
    if(GORNISHT == tree_p)
        return LEAF;
    enum tree_type type = *((enum tree_type*) (tree_p));
    assert(STEM == type || FORK == type);
    return type;
}

byte* tree_get_left(byte* tree_p)
{
    enum tree_type type = tree_get_type(tree_p);
    if(STEM == type)
        return ((struct stem_s*)(tree_p))->left;
    assert(FORK == type);
        return ((struct fork_s*)(tree_p))->left;
}

byte* tree_get_right(byte* tree_p)
{
    enum tree_type type = tree_get_type(tree_p);
    assert(FORK == type);
        return ((struct fork_s*)(tree_p))->right;
}

void tree_destroy(byte* tree_p)
{
    enum tree_type type = tree_get_type(tree_p);
    if(STEM == type) { tree_destroy(tree_get_left(tree_p)); }
    if(FORK == type) { tree_destroy(tree_get_left(tree_p)); tree_destroy(tree_get_right(tree_p)); }
    free(tree_p);
}

byte* tree_create_copy(byte* tree_p)
{
    enum tree_type type = tree_get_type(tree_p);
    if(LEAF == type)
        return tree_create_leaf();
    if(STEM == type)
        return tree_create_stem(tree_create_copy(tree_get_left(tree_p)));
    assert(FORK == type);
    return tree_create_fork(tree_create_copy(tree_get_left(tree_p)), tree_create_copy(tree_get_right(tree_p)));
}

// inputs are to be treated as copies. if you create them inside the call, no one will destroy them.
byte* tree_create_app(byte* tree1_p, byte* tree2_p)
{
    byte* tmp1 = GORNISHT;
    byte* tmp2 = GORNISHT;
    byte* ret = GORNISHT;
    enum tree_type type1;
    enum tree_type type2;

    type1 = tree_get_type(tree1_p);
    if(LEAF == type1)
    {
        COUNT_1 += 1;
        return tree_create_stem(tree_create_copy(tree2_p));
    }
    if(STEM == type1)
    {
        COUNT_2 += 1;
        return tree_create_fork(tree_create_copy(tree_get_left(tree1_p)), tree_create_copy(tree2_p));
    }
    assert(FORK == type1);

    type2 = tree_get_type(tree_get_left(tree1_p));
    if(LEAF == type2)
    {
        COUNT_3 += 1;
        return tree_create_copy(tree_get_right(tree1_p));
    }
    if(STEM == type2)
    {
        COUNT_4 += 1;
        tmp1 = tree_create_app(tree_get_left(tree_get_left(tree1_p)), tree2_p);
        tmp2 = tree_create_app(tree_get_right(tree1_p), tree2_p);
        ret =  tree_create_app(tmp2, tmp1); // !!!!!! changed order
        tree_destroy(tmp1);
        tree_destroy(tmp2);
        return ret;
    }
    // !!!!!! changed logic
    assert(FORK == type2);
    COUNT_5 += 1;
    tmp1 = tree_create_app(tree2_p, tree_get_left(tree_get_left(tree1_p)));
    ret = tree_create_app(tmp1, tree_get_right(tree_get_left(tree1_p)));
    tree_destroy(tmp1);
    return ret;
}

void tree_print_i(byte* tree_p)
{
    enum tree_type type = tree_get_type(tree_p);
    if(LEAF == type)
    {
        printf("LEAF "); 
    }
    else if(STEM == type)
    { 
        printf("STEM "); 
        tree_print_i(tree_get_left(tree_p)); 
    }
    else if(FORK == type) 
    { 
        printf("FORK "); 
        tree_print_i(tree_get_left(tree_p)); 
        tree_print_i(tree_get_right(tree_p)); 
    }
    else assert(false);
}

void tree_print(byte* tree_p) { tree_print_i(tree_p); printf("\n"); }

// x y z means (xy)z not x(yz)
byte* tree_create_double_app(byte* tree1_p, byte* tree2_p, byte* tree3_p)
{
    byte* tmp = tree_create_app(tree1_p, tree2_p);
    byte* ret = tree_create_app(tmp, tree3_p);
    tree_destroy(tmp);
    return ret;
}

bool tree_is_equal(byte* tree1_p, byte* tree2_p)
{
    enum tree_type type1 = tree_get_type(tree1_p);
    enum tree_type type2 = tree_get_type(tree2_p);
    if(type1 != type2)
        return false;
    if(LEAF == type1)
        return true;
    if(STEM == type1)
        return tree_is_equal(tree_get_left(tree1_p), tree_get_left(tree2_p));
    assert(FORK == type1);
    return tree_is_equal(tree_get_left(tree1_p), tree_get_left(tree2_p)) && tree_is_equal(tree_get_right(tree1_p), tree_get_right(tree2_p));
}

bool tree_truth_value(byte* tree_p)
{
    byte* K = tree_create_stem(tree_create_leaf());
    byte* I = tree_create_fork(tree_create_copy(K), tree_create_copy(K));
    byte* KI = tree_create_app(K,I);
    byte ret;
    if(tree_is_equal(K, tree_p))
        ret = true;
    else if(tree_is_equal(KI, tree_p))
        ret = false;
    else
        assert(false);
    
    tree_destroy(K);
    tree_destroy(I);
    tree_destroy(KI);
    return ret;
}

int main()
{
    // creating basic trees
    byte* L = tree_create_leaf();
    byte* K = tree_create_stem(tree_create_copy(L));
    byte* I = tree_create_fork(tree_create_copy(K), tree_create_copy(K));
    byte* KI = tree_create_app(K,I);
    byte* D = tree_create_fork(tree_create_copy(K), tree_create_fork(tree_create_copy(L), tree_create_copy(L)));
    byte* T = tree_create_copy(K);
    byte* F = tree_create_copy(KI);
    byte* tmp1 = tree_create_app(K, D);
    byte* tmp2 = tree_create_app(D, K);
    byte* tmp3 = tree_create_app(tmp2, tmp1);
    byte* tmp4 = tree_create_app(D, tmp1);
    byte* S = tree_create_app(tmp4, tmp3);
    byte* AND = tree_create_stem(tree_create_stem(tree_create_fork(tree_create_copy(L), tree_create_fork(tree_create_copy(L), tree_create_copy(I)))));
    byte* AND_T_T = tree_create_double_app(AND, T, T);
    byte* AND_F_T = tree_create_double_app(AND, F, T);
    byte* AND_T_F = tree_create_double_app(AND, T, F);
    byte* AND_F_F = tree_create_double_app(AND, F, F);

    byte* OR = tree_create_fork(tree_create_stem(tree_create_fork(tree_create_leaf(), tree_create_copy(T))), tree_create_copy(I));
    byte* IMPLIES = tree_create_stem(tree_create_stem(tree_create_fork(tree_create_leaf(), tree_create_copy(T))));
    byte* NOT = tree_create_fork(tree_create_stem(tree_create_fork(tree_create_leaf(), tree_create_copy(T))), tree_create_fork(tree_create_stem(tree_create_fork(tree_create_leaf(), tree_create_fork(tree_create_leaf(), tree_create_copy(I)))), tree_create_copy(I)));
    byte* IFF = tree_create_fork(tree_create_fork(tree_create_copy(I), tree_create_fork(tree_create_stem(tree_create_fork(tree_create_leaf(), tree_create_copy(T))), tree_create_fork(tree_create_stem(tree_create_fork(tree_create_leaf(), tree_create_fork(tree_create_leaf(), tree_create_copy(I)))), tree_create_copy(I)))), tree_create_leaf());


    byte* NOT_T = tree_create_app(NOT, T);
    byte* NOT_F = tree_create_app(NOT, F);


    byte* OR_T_T = tree_create_double_app(OR, T, T);
    byte* OR_F_T = tree_create_double_app(OR, F, T);
    byte* OR_T_F = tree_create_double_app(OR, T, F);
    byte* OR_F_F = tree_create_double_app(OR, F, F);

    byte* IMPLIES_T_T = tree_create_double_app(IMPLIES, T, T);
    byte* IMPLIES_F_T = tree_create_double_app(IMPLIES, F, T);
    byte* IMPLIES_T_F = tree_create_double_app(IMPLIES, T, F);
    byte* IMPLIES_F_F = tree_create_double_app(IMPLIES, F, F);

    byte* IFF_T_T = tree_create_double_app(IFF, T, T);
    byte* IFF_F_T = tree_create_double_app(IFF, F, T);
    byte* IFF_T_F = tree_create_double_app(IFF, T, F);
    byte* IFF_F_F = tree_create_double_app(IFF, F, F);


    assert(tree_truth_value(AND_T_T));
    assert(!tree_truth_value(AND_F_T));
    assert(!tree_truth_value(AND_T_F));
    assert(!tree_truth_value(AND_F_F));

    assert(tree_truth_value(OR_T_T));
    assert(tree_truth_value(OR_F_T));
    assert(tree_truth_value(OR_T_F));
    assert(!tree_truth_value(OR_F_F));


    assert(tree_truth_value(IMPLIES_T_T));
    assert(tree_truth_value(IMPLIES_F_T));
    assert(!tree_truth_value(IMPLIES_T_F));
    assert(tree_truth_value(IMPLIES_F_F));



    assert(tree_truth_value(IFF_T_T));
    assert(!tree_truth_value(IFF_F_T));
    assert(!tree_truth_value(IFF_T_F));
    assert(tree_truth_value(IFF_F_F));


    assert(!tree_truth_value(NOT_T));
    assert(tree_truth_value(NOT_F));


    byte* DII = tree_create_double_app(D, I, I);
    //printf("start\n");
    //byte* DII_DII = tree_create_app(DII, DII);
    //printf("end\n");

    printf("\n L = \n"); tree_print(L);
    printf("\n I = \n"); tree_print(I);
    printf("\n K = \n"); tree_print(K);
    printf("\n D = \n"); tree_print(D);
    printf("\n S = \n"); tree_print(S);
    printf("\n KI = \n"); tree_print(KI);
    printf("\n AND = \n"); tree_print(AND);
    printf("\n AND_T_T = \n"); tree_print(AND_T_T);
    printf("\n AND_F_T = \n"); tree_print(AND_F_T);
    printf("\n AND_T_F = \n"); tree_print(AND_T_F);
    printf("\n AND_F_F = \n"); tree_print(AND_F_F);
    printf("\n T = \n"); tree_print(T);
    printf("\n F = \n"); tree_print(F);


    printf("counts %d %d %d %d %d\n", COUNT_1, COUNT_2, COUNT_3, COUNT_4, COUNT_5);


    tree_destroy(L);
    tree_destroy(K);
    tree_destroy(I);
    tree_destroy(KI);
    tree_destroy(D);
    tree_destroy(T);
    tree_destroy(F);
    tree_destroy(S);
    tree_destroy(tmp1);
    tree_destroy(tmp2);
    tree_destroy(tmp3);
    tree_destroy(tmp4);
    tree_destroy(AND);
    tree_destroy(AND_T_T);
    tree_destroy(AND_F_T);
    tree_destroy(AND_T_F);
    tree_destroy(AND_F_F);
    tree_destroy(OR);
    tree_destroy(OR_T_T);
    tree_destroy(OR_F_T);
    tree_destroy(OR_T_F);
    tree_destroy(OR_F_F);

    tree_destroy(IMPLIES);
    tree_destroy(NOT);
    tree_destroy(IFF);

    tree_destroy(IFF_T_T);
    tree_destroy(IFF_F_T);
    tree_destroy(IFF_T_F);
    tree_destroy(IFF_F_F);

    tree_destroy(IMPLIES_T_T);
    tree_destroy(IMPLIES_F_T);
    tree_destroy(IMPLIES_T_F);
    tree_destroy(IMPLIES_F_F);

    tree_destroy(NOT_T);
    tree_destroy(NOT_F);


    tree_destroy(DII);

    return 0;
}